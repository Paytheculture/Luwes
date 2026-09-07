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
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

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

  const rows = (res.data.values || []).filter((row) => row && safeString(row, 0).trim() !== '');
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
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Pesanan!A2:K',
  });
  const rawRows = res.data.values || [];
  const targetId = decodeURIComponent(String(id || '')).trim().toLowerCase();
  const idx = rawRows.findIndex((row) => row && safeString(row, 0).trim().toLowerCase() === targetId);
  if (idx === -1) return null;

  const row = rawRows[idx];
  let items = [];
  const itemsJSON = safeString(row, 6);
  if (itemsJSON) {
    try { items = JSON.parse(itemsJSON); } catch (e) {}
  }

  const data = {
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

  return { data, rowNum: idx + 2 };
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
    range: 'Pesanan!A:A',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
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
  await srv.spreadsheets.values.update({
    spreadsheetId,
    range: `Pesanan!A${existing.rowNum}:K${existing.rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['', '', '', '', '', '', '', '', '', '', '']] },
  });
}

// ============ ITEMS ============

export async function getAllItems() {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Items!A2:F',
  });

  const rows = (res.data.values || []).filter((row) => row && safeString(row, 0).trim() !== '');
  return rows.map((row) => ({
    id: safeString(row, 0),
    nama: safeString(row, 1),
    harga: safeInt(row, 2),
    gambar_url: safeString(row, 3),
    deskripsi: safeString(row, 4),
    kategori: safeString(row, 5),
  }));
}

export async function getItemById(id) {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Items!A2:F',
  });
  const rawRows = res.data.values || [];
  const idx = rawRows.findIndex((row) => row && safeString(row, 0).trim() === id);
  if (idx === -1) return null;

  const row = rawRows[idx];
  const data = {
    id: safeString(row, 0),
    nama: safeString(row, 1),
    harga: safeInt(row, 2),
    gambar_url: safeString(row, 3),
    deskripsi: safeString(row, 4),
    kategori: safeString(row, 5),
  };

  return { data, rowNum: idx + 2 };
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
    item.kategori || '',
  ];

  await srv.spreadsheets.values.append({
    spreadsheetId,
    range: 'Items!A:A',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
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
    item.kategori || '',
  ];

  const range = `Items!A${existing.rowNum}:F${existing.rowNum}`;
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
  await srv.spreadsheets.values.update({
    spreadsheetId,
    range: `Items!A${existing.rowNum}:F${existing.rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['', '', '', '', '', '']] },
  });
}

// ============ MODEL DEKORASI ============

export async function getAllModels() {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Model!A2:E',
  });

  const rows = (res.data.values || []).filter((row) => row && safeString(row, 0).trim() !== '');
  return rows.map((row) => ({
    id: safeString(row, 0),
    nama: safeString(row, 1),
    deskripsi: safeString(row, 2),
    gambar_url: safeString(row, 3),
  }));
}

export async function getModelById(id) {
  const { srv, spreadsheetId } = getSheetsClient();
  const res = await srv.spreadsheets.values.get({
    spreadsheetId,
    range: 'Model!A2:E',
  });
  const rawRows = res.data.values || [];
  const idx = rawRows.findIndex((row) => row && safeString(row, 0).trim() === id);
  if (idx === -1) return null;

  const row = rawRows[idx];
  const data = {
    id: safeString(row, 0),
    nama: safeString(row, 1),
    deskripsi: safeString(row, 2),
    gambar_url: safeString(row, 3),
  };

  return { data, rowNum: idx + 2 };
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
    range: 'Model!A:A',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
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
  await srv.spreadsheets.values.update({
    spreadsheetId,
    range: `Model!A${existing.rowNum}:D${existing.rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['', '', '', '']] },
  });
}
