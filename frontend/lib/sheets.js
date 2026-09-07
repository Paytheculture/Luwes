import { google } from 'googleapis';

let sheetsClient = null;

export function getSheetsClient() {
  if (sheetsClient) return { srv: sheetsClient, spreadsheetId: process.env.SPREADSHEET_ID };

  let credJSON = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!credJSON) {
    const c1 = process.env.GOOGLE_CRED_1 || '';
    const c2 = process.env.GOOGLE_CRED_2 || '';
    const c3 = process.env.GOOGLE_CRED_3 || '';
    credJSON = c1 + c2 + c3;
  }

  if (!credJSON) {
    throw new Error('GOOGLE_CREDENTIALS_JSON tidak dikonfigurasi di Environment Variables.');
  }

  const credentials = JSON.parse(credJSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return { srv: sheetsClient, spreadsheetId: process.env.SPREADSHEET_ID };
}

function safeString(row, idx) {
  if (!row || idx >= row.length || row[idx] === null || row[idx] === undefined) return '';
  return String(row[idx]);
}

function safeInt(row, idx) {
  const val = safeString(row, idx);
  if (!val) return 0;
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
}

// ============ PESANAN ============

export async function getAllPesanan() {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Pesanan!A2:K',
  });

  const rows = res.data.values || [];
  return rows.map((row) => {
    let items = [];
    const itemsJSON = safeString(row, 6);
    if (itemsJSON) {
      try { items = JSON.parse(itemsJSON); } catch (e) {}
    }

    return {
      id: safeString(row, 0),
      nama_pengantin: safeString(row, 1),
      alamat: safeString(row, 2),
      no_hp: safeString(row, 3),
      tanggal_pasang: safeString(row, 4),
      tanggal_bongkar: safeString(row, 5),
      items,
      total_harga: safeInt(row, 7),
      status: safeString(row, 8),
      catatan: safeString(row, 9),
      created_at: safeString(row, 10),
    };
  });
}

export async function getPesananById(id) {
  const list = await getAllPesanan();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  return { data: list[idx], rowNum: idx + 2 };
}

export async function createPesanan(pesanan) {
  const { srv, spreadsheetId } = getSheetsClient();
  const itemsJSON = JSON.stringify(pesanan.items || []);
  const now = new Date().toISOString();

  const values = [
    pesanan.id || `ORD-${Date.now()}`,
    pesanan.nama_pengantin || '',
    pesanan.alamat || '',
    pesanan.no_hp || '',
    pesanan.tanggal_pasang || '',
    pesanan.tanggal_bongkar || '',
    itemsJSON,
    pesanan.total_harga || 0,
    pesanan.status || 'Pending',
    pesanan.catatan || '',
    now,
  ];

  await srv.spreadsheets.values.append({
    spreadsheetId,
    range: 'Pesanan!A:K',
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });

  return { ...pesanan, id: values[0], created_at: now };
}

export async function updatePesanan(id, pesanan) {
  const existing = await getPesananById(id);
  if (!existing) throw new Error('Pesanan tidak ditemukan');

  const { srv, spreadsheetId } = getSheetsClient();
  const itemsJSON = JSON.stringify(pesanan.items || []);

  const values = [
    id,
    pesanan.nama_pengantin || '',
    pesanan.alamat || '',
    pesanan.no_hp || '',
    pesanan.tanggal_pasang || '',
    pesanan.tanggal_bongkar || '',
    itemsJSON,
    pesanan.total_harga || 0,
    pesanan.status || 'Pending',
    pesanan.catatan || '',
    existing.data.created_at || new Date().toISOString(),
  ];

  const range = `Pesanan!A${existing.rowNum}:K${existing.rowNum}`;
  await srv.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });

  return { ...pesanan, id };
}

export async function deletePesanan(id) {
  const existing = await getPesananById(id);
  if (!existing) throw new Error('Pesanan tidak ditemukan');

  const { srv, spreadsheetId } = getSheetsClient();
  const sp = await srv.spreadsheets.get({ spreadsheetId });
  const sheet = sp.data.sheets.find((s) => s.properties.title === 'Pesanan');
  const sheetId = sheet?.properties?.sheetId || 0;

  await srv.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: existing.rowNum - 1,
              endIndex: existing.rowNum,
            },
          },
        },
      ],
    },
  });
}

// ============ ITEMS ============

export async function getAllItems() {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Items!A2:E',
  });

  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: safeString(row, 0),
    nama: safeString(row, 1),
    harga: safeInt(row, 2),
    gambar_url: safeString(row, 3),
    deskripsi: safeString(row, 4),
  }));
}

export async function getItemById(id) {
  const items = await getAllItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  return { data: items[idx], rowNum: idx + 2 };
}

export async function createItem(item) {
  const { srv, spreadsheetId } = getSheetsClient();
  const id = item.id || `ITM-${Date.now()}`;

  const values = [
    id,
    item.nama || '',
    item.harga || 0,
    item.gambar_url || '',
    item.deskripsi || '',
  ];

  await srv.spreadsheets.values.append({
    spreadsheetId,
    range: 'Items!A:E',
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });

  return { ...item, id };
}

export async function updateItem(id, item) {
  const existing = await getItemById(id);
  if (!existing) throw new Error('Item tidak ditemukan');

  const { srv, spreadsheetId } = getSheetsClient();
  const values = [
    id,
    item.nama || '',
    item.harga || 0,
    item.gambar_url || '',
    item.deskripsi || '',
  ];

  const range = `Items!A${existing.rowNum}:E${existing.rowNum}`;
  await srv.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });

  return { ...item, id };
}

export async function deleteItem(id) {
  const existing = await getItemById(id);
  if (!existing) throw new Error('Item tidak ditemukan');

  const { srv, spreadsheetId } = getSheetsClient();
  const sp = await srv.spreadsheets.get({ spreadsheetId });
  const sheet = sp.data.sheets.find((s) => s.properties.title === 'Items');
  const sheetId = sheet?.properties?.sheetId || 0;

  await srv.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: existing.rowNum - 1,
              endIndex: existing.rowNum,
            },
          },
        },
      ],
    },
  });
}

// ============ MODEL DEKORASI ============

export async function getAllModels() {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Model!A2:E',
  });

  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: safeString(row, 0),
    nama: safeString(row, 1),
    deskripsi: safeString(row, 2),
    gambar_url: safeString(row, 3),
  }));
}

export async function getModelById(id) {
  const models = await getAllModels();
  const idx = models.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  return { data: models[idx], rowNum: idx + 2 };
}

export async function createModel(model) {
  const { srv, spreadsheetId } = getSheetsClient();
  const id = model.id || `MDL-${Date.now()}`;

  const values = [
    id,
    model.nama || '',
    model.deskripsi || '',
    model.gambar_url || '',
  ];

  await srv.spreadsheets.values.append({
    spreadsheetId,
    range: 'Model!A:E',
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });

  return { ...model, id };
}

export async function updateModel(id, model) {
  const existing = await getModelById(id);
  if (!existing) throw new Error('Model tidak ditemukan');

  const { srv, spreadsheetId } = getSheetsClient();
  const values = [
    id,
    model.nama || '',
    model.deskripsi || '',
    model.gambar_url || '',
  ];

  const range = `Model!A${existing.rowNum}:D${existing.rowNum}`;
  await srv.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });

  return { ...model, id };
}

export async function deleteModel(id) {
  const existing = await getModelById(id);
  if (!existing) throw new Error('Model tidak ditemukan');

  const { srv, spreadsheetId } = getSheetsClient();
  const sp = await srv.spreadsheets.get({ spreadsheetId });
  const sheet = sp.data.sheets.find((s) => s.properties.title === 'Model');
  const sheetId = sheet?.properties?.sheetId || 0;

  await srv.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: existing.rowNum - 1,
              endIndex: existing.rowNum,
            },
          },
        },
      ],
    },
  });
}
