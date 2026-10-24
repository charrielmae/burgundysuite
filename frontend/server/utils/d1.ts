const D1_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'b730d1dce2f590cd1ae5726758a0e590',
  databaseId: process.env.CLOUDFLARE_DATABASE_ID || '9b1eb0fe-1e04-44d1-9cc7-e1a800009618',
  apiToken:
    process.env.CLOUDFLARE_API_TOKEN ||
    Buffer.from('Y2Z1dF9maE0ySTNib3NQeWVqU3VxZDdadW1jRzFDejRuQk9xNU5nVnpacGEwNDYxYmUwMmM=', 'base64').toString('utf8'),
};

export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${D1_CONFIG.accountId}/d1/database/${D1_CONFIG.databaseId}/query`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${D1_CONFIG.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });
    const data = await res.json();
    if (data.success && data.result?.[0]?.results) {
      return data.result[0].results as T[];
    }
    return [];
  } catch (err) {
    console.warn('[Cloudflare D1 Query Warning]:', (err as Error).message);
    return [];
  }
}

export async function getStaffAccountsFromD1(): Promise<any[]> {
  const sql = `
    SELECT u.user_id, u.user_name, u.user_role, u.acc_status, u.created_date,
           s.staff_id, s.first_name, s.last_name, s.position, s.contact_number
    FROM USER_ACCOUNT u
    LEFT JOIN STAFF_DETAILS s ON u.user_id = s.user_id
    WHERE u.user_role IN ('admin', 'staff')
    ORDER BY u.user_id ASC;
  `;
  return queryD1(sql);
}

export async function saveAccountToD1(user: {
  user_name: string;
  password: string;
  user_role: string;
  first_name: string;
  last_name: string;
  position: string;
  contact_number: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const cleanUsername = user.user_name.trim();

    // Check if user already exists in D1
    const existing = await queryD1(
      'SELECT user_id FROM USER_ACCOUNT WHERE LOWER(user_name) = ? LIMIT 1;',
      [cleanUsername.toLowerCase()]
    );
    if (existing.length > 0) {
      return {
        success: false,
        error: `Username '${cleanUsername}' already exists in the database.`,
      };
    }

    const maxUserRows = await queryD1<{ max_id: number }>('SELECT MAX(user_id) as max_id FROM USER_ACCOUNT;');
    const newUserId = (Number(maxUserRows[0]?.max_id) || 100) + 1;

    const maxStaffRows = await queryD1<{ max_id: number }>('SELECT MAX(staff_id) as max_id FROM STAFF_DETAILS;');
    const newStaffId = (Number(maxStaffRows[0]?.max_id) || 200) + 1;

    const nowIso = new Date().toISOString();

    // Insert into USER_ACCOUNT
    await queryD1(
      `INSERT INTO USER_ACCOUNT (user_id, user_name, password_hash, user_role, acc_status, created_date) VALUES (?, ?, ?, ?, 'active', ?);`,
      [newUserId, cleanUsername, user.password.trim(), user.user_role, nowIso]
    );

    // Insert into STAFF_DETAILS
    await queryD1(
      `INSERT INTO STAFF_DETAILS (staff_id, user_id, first_name, last_name, position, contact_number) VALUES (?, ?, ?, ?, ?, ?);`,
      [newStaffId, newUserId, user.first_name.trim(), user.last_name.trim(), user.position.trim(), user.contact_number.trim()]
    );

    const createdRecord = {
      user_id: newUserId,
      user_name: cleanUsername,
      user_role: user.user_role,
      acc_status: 'active',
      created_date: nowIso,
      staff_id: newStaffId,
      first_name: user.first_name.trim(),
      last_name: user.last_name.trim(),
      position: user.position.trim(),
      contact_number: user.contact_number.trim(),
    };

    return { success: true, data: createdRecord };
  } catch (err: any) {
    console.warn('[Cloudflare D1 Save Warning]:', err?.message || err);
    return { success: false, error: err?.message || 'Database insert failed' };
  }
}

export async function updateAccountInD1(user: {
  user_id: number;
  user_name?: string;
  password?: string;
  user_role?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  contact_number?: string;
}): Promise<boolean> {
  try {
    if (user.password && user.user_role) {
      await queryD1(
        'UPDATE USER_ACCOUNT SET password_hash = ?, user_role = ? WHERE user_id = ?;',
        [user.password.trim(), user.user_role, user.user_id]
      );
    } else if (user.password) {
      await queryD1(
        'UPDATE USER_ACCOUNT SET password_hash = ? WHERE user_id = ?;',
        [user.password.trim(), user.user_id]
      );
    } else if (user.user_role) {
      await queryD1(
        'UPDATE USER_ACCOUNT SET user_role = ? WHERE user_id = ?;',
        [user.user_role, user.user_id]
      );
    }

    if (user.user_name) {
      await queryD1(
        'UPDATE USER_ACCOUNT SET user_name = ? WHERE user_id = ?;',
        [user.user_name.trim(), user.user_id]
      );
    }

    if (user.first_name || user.last_name || user.position || user.contact_number) {
      const existingStaff = await queryD1('SELECT staff_id FROM STAFF_DETAILS WHERE user_id = ? LIMIT 1;', [user.user_id]);
      if (existingStaff.length > 0) {
        await queryD1(
          `UPDATE STAFF_DETAILS SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), position = COALESCE(?, position), contact_number = COALESCE(?, contact_number) WHERE user_id = ?;`,
          [user.first_name?.trim() || null, user.last_name?.trim() || null, user.position?.trim() || null, user.contact_number?.trim() || null, user.user_id]
        );
      } else {
        const maxStaffRows = await queryD1<{ max_id: number }>('SELECT MAX(staff_id) as max_id FROM STAFF_DETAILS;');
        const newStaffId = (Number(maxStaffRows[0]?.max_id) || 200) + 1;
        await queryD1(
          `INSERT INTO STAFF_DETAILS (staff_id, user_id, first_name, last_name, position, contact_number) VALUES (?, ?, ?, ?, ?, ?);`,
          [newStaffId, user.user_id, user.first_name?.trim() || 'Staff', user.last_name?.trim() || '', user.position?.trim() || 'Staff Concierge', user.contact_number?.trim() || '+63 917 000 0000']
        );
      }
    }
    return true;
  } catch (err: any) {
    console.warn('[Cloudflare D1 Update Warning]:', err?.message || err);
    return false;
  }
}

export async function deleteAccountFromD1(userId: number): Promise<boolean> {
  try {
    await queryD1('DELETE FROM STAFF_DETAILS WHERE user_id = ?;', [userId]);
    await queryD1('DELETE FROM USER_ACCOUNT WHERE user_id = ?;', [userId]);
    return true;
  } catch (err: any) {
    console.warn('[Cloudflare D1 Delete Warning]:', err?.message || err);
    return false;
  }
}

export async function findUserInD1(identifier: string): Promise<any | null> {
  try {
    const clean = identifier.trim().toLowerCase();
    const sql = `
      SELECT u.user_id, u.user_name, u.password_hash, u.user_role, u.acc_status,
             s.first_name, s.last_name, s.position, s.contact_number
      FROM USER_ACCOUNT u
      LEFT JOIN STAFF_DETAILS s ON u.user_id = s.user_id
      WHERE LOWER(u.user_name) = ? OR LOWER(u.user_name || '@burgundysuite.com') = ?
      LIMIT 1;
    `;
    const rows = await queryD1(sql, [clean, clean]);
    return rows[0] || null;
  } catch {
    return null;
  }
}
