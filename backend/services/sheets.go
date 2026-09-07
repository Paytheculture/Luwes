package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"luwes-dekorasi-api/models"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type SheetsService struct {
	srv           *sheets.Service
	spreadsheetID string
}

func NewSheetsService() (*SheetsService, error) {
	ctx := context.Background()

	credJSON := os.Getenv("GOOGLE_CREDENTIALS_JSON")
	if credJSON == "" {
		// Bypass limit panjang karakter Back4App (1023 char limit)
		cred1 := os.Getenv("GOOGLE_CRED_1")
		cred2 := os.Getenv("GOOGLE_CRED_2")
		cred3 := os.Getenv("GOOGLE_CRED_3")
		credJSON = cred1 + cred2 + cred3
	}

	if credJSON == "" {
		return nil, fmt.Errorf("GOOGLE_CREDENTIALS_JSON not set")
	}

	srv, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(credJSON)))
	if err != nil {
		return nil, fmt.Errorf("failed to create sheets service: %w", err)
	}

	spreadsheetID := os.Getenv("SPREADSHEET_ID")
	if spreadsheetID == "" {
		return nil, fmt.Errorf("SPREADSHEET_ID not set")
	}

	return &SheetsService{srv: srv, spreadsheetID: spreadsheetID}, nil
}

// ============ PESANAN ============

func (s *SheetsService) GetAllPesanan() ([]models.Pesanan, error) {
	resp, err := s.srv.Spreadsheets.Values.Get(s.spreadsheetID, "Pesanan!A2:K").Do()
	if err != nil {
		return nil, err
	}

	var pesananList []models.Pesanan
	for _, row := range resp.Values {
		p := models.Pesanan{
			ID:             safeString(row, 0),
			NamaPengantin:  safeString(row, 1),
			Alamat:         safeString(row, 2),
			NoHP:           safeString(row, 3),
			TanggalPasang:  safeString(row, 4),
			TanggalBongkar: safeString(row, 5),
			TotalHarga:     safeInt64(row, 7),
			Status:         safeString(row, 8),
			Catatan:        safeString(row, 9),
		}

		itemsJSON := safeString(row, 6)
		if itemsJSON != "" {
			json.Unmarshal([]byte(itemsJSON), &p.Items)
		}

		createdStr := safeString(row, 10)
		if createdStr != "" {
			p.CreatedAt, _ = time.Parse(time.RFC3339, createdStr)
		}

		pesananList = append(pesananList, p)
	}

	return pesananList, nil
}

func (s *SheetsService) GetPesananByID(id string) (*models.Pesanan, int, error) {
	pesananList, err := s.GetAllPesanan()
	if err != nil {
		return nil, 0, err
	}

	for i, p := range pesananList {
		if p.ID == id {
			return &p, i + 2, nil // +2 because row 1 is header, rows are 1-indexed
		}
	}

	return nil, 0, fmt.Errorf("pesanan not found")
}

func (s *SheetsService) CreatePesanan(p models.Pesanan) error {
	itemsJSON, _ := json.Marshal(p.Items)

	values := []interface{}{
		p.ID,
		p.NamaPengantin,
		p.Alamat,
		p.NoHP,
		p.TanggalPasang,
		p.TanggalBongkar,
		string(itemsJSON),
		p.TotalHarga,
		p.Status,
		p.Catatan,
		p.CreatedAt.Format(time.RFC3339),
	}

	vr := &sheets.ValueRange{
		Values: [][]interface{}{values},
	}

	_, err := s.srv.Spreadsheets.Values.Append(
		s.spreadsheetID, "Pesanan!A:K", vr,
	).ValueInputOption("RAW").Do()

	return err
}

func (s *SheetsService) UpdatePesanan(id string, p models.Pesanan) error {
	_, rowNum, err := s.GetPesananByID(id)
	if err != nil {
		return err
	}

	itemsJSON, _ := json.Marshal(p.Items)

	values := []interface{}{
		p.ID,
		p.NamaPengantin,
		p.Alamat,
		p.NoHP,
		p.TanggalPasang,
		p.TanggalBongkar,
		string(itemsJSON),
		p.TotalHarga,
		p.Status,
		p.Catatan,
		p.CreatedAt.Format(time.RFC3339),
	}

	vr := &sheets.ValueRange{
		Values: [][]interface{}{values},
	}

	rangeStr := fmt.Sprintf("Pesanan!A%d:K%d", rowNum, rowNum)
	_, err = s.srv.Spreadsheets.Values.Update(
		s.spreadsheetID, rangeStr, vr,
	).ValueInputOption("RAW").Do()

	return err
}

func (s *SheetsService) DeletePesanan(id string) error {
	_, rowNum, err := s.GetPesananByID(id)
	if err != nil {
		return err
	}

	// Get spreadsheet to find sheet ID
	sp, err := s.srv.Spreadsheets.Get(s.spreadsheetID).Do()
	if err != nil {
		return err
	}

	var sheetID int64
	for _, sheet := range sp.Sheets {
		if sheet.Properties.Title == "Pesanan" {
			sheetID = sheet.Properties.SheetId
			break
		}
	}

	req := &sheets.BatchUpdateSpreadsheetRequest{
		Requests: []*sheets.Request{
			{
				DeleteDimension: &sheets.DeleteDimensionRequest{
					Range: &sheets.DimensionRange{
						SheetId:    sheetID,
						Dimension:  "ROWS",
						StartIndex: int64(rowNum - 1),
						EndIndex:   int64(rowNum),
					},
				},
			},
		},
	}

	_, err = s.srv.Spreadsheets.BatchUpdate(s.spreadsheetID, req).Do()
	return err
}

// ============ ITEMS ============

func (s *SheetsService) GetAllItems() ([]models.Item, error) {
	resp, err := s.srv.Spreadsheets.Values.Get(s.spreadsheetID, "Items!A2:E").Do()
	if err != nil {
		return nil, err
	}

	var items []models.Item
	for _, row := range resp.Values {
		item := models.Item{
			ID:        safeString(row, 0),
			Nama:      safeString(row, 1),
			Harga:     safeInt64(row, 2),
			GambarURL: safeString(row, 3),
			Deskripsi: safeString(row, 4),
		}
		items = append(items, item)
	}

	return items, nil
}

func (s *SheetsService) GetItemByID(id string) (*models.Item, int, error) {
	items, err := s.GetAllItems()
	if err != nil {
		return nil, 0, err
	}

	for i, item := range items {
		if item.ID == id {
			return &item, i + 2, nil
		}
	}

	return nil, 0, fmt.Errorf("item not found")
}

func (s *SheetsService) CreateItem(item models.Item) error {
	values := []interface{}{
		item.ID,
		item.Nama,
		item.Harga,
		item.GambarURL,
		item.Deskripsi,
	}

	vr := &sheets.ValueRange{
		Values: [][]interface{}{values},
	}

	_, err := s.srv.Spreadsheets.Values.Append(
		s.spreadsheetID, "Items!A:E", vr,
	).ValueInputOption("RAW").Do()

	return err
}

func (s *SheetsService) UpdateItem(id string, item models.Item) error {
	_, rowNum, err := s.GetItemByID(id)
	if err != nil {
		return err
	}

	values := []interface{}{
		item.ID,
		item.Nama,
		item.Harga,
		item.GambarURL,
		item.Deskripsi,
	}

	vr := &sheets.ValueRange{
		Values: [][]interface{}{values},
	}

	rangeStr := fmt.Sprintf("Items!A%d:E%d", rowNum, rowNum)
	_, err = s.srv.Spreadsheets.Values.Update(
		s.spreadsheetID, rangeStr, vr,
	).ValueInputOption("RAW").Do()

	return err
}

func (s *SheetsService) DeleteItem(id string) error {
	_, rowNum, err := s.GetItemByID(id)
	if err != nil {
		return err
	}

	sp, err := s.srv.Spreadsheets.Get(s.spreadsheetID).Do()
	if err != nil {
		return err
	}

	var sheetID int64
	for _, sheet := range sp.Sheets {
		if sheet.Properties.Title == "Items" {
			sheetID = sheet.Properties.SheetId
			break
		}
	}

	req := &sheets.BatchUpdateSpreadsheetRequest{
		Requests: []*sheets.Request{
			{
				DeleteDimension: &sheets.DeleteDimensionRequest{
					Range: &sheets.DimensionRange{
						SheetId:    sheetID,
						Dimension:  "ROWS",
						StartIndex: int64(rowNum - 1),
						EndIndex:   int64(rowNum),
					},
				},
			},
		},
	}

	_, err = s.srv.Spreadsheets.BatchUpdate(s.spreadsheetID, req).Do()
	return err
}

// ============ USERS ============

func (s *SheetsService) GetUserByUsername(username string) (*models.User, error) {
	resp, err := s.srv.Spreadsheets.Values.Get(s.spreadsheetID, "Users!A2:E").Do()
	if err != nil {
		return nil, err
	}

	for _, row := range resp.Values {
		if safeString(row, 1) == username {
			return &models.User{
				ID:           safeString(row, 0),
				Username:     safeString(row, 1),
				PasswordHash: safeString(row, 2),
				Nama:         safeString(row, 3),
				Role:         safeString(row, 4),
			}, nil
		}
	}

	return nil, fmt.Errorf("user not found")
}

// ==========================================
// MODEL DEKORASI CRUD
// ==========================================

func (s *SheetsService) GetAllModels() ([]models.ModelDekor, error) {
	readRange := "Model!A2:E"
	resp, err := s.srv.Spreadsheets.Values.Get(s.spreadsheetID, readRange).Do()
	if err != nil {
		return nil, err
	}

	var data []models.ModelDekor
	for _, row := range resp.Values {
		if len(row) < 2 {
			continue // ID dan Nama minimal ada
		}
		data = append(data, models.ModelDekor{
			ID:        safeString(row, 0),
			Nama:      safeString(row, 1),
			Deskripsi: safeString(row, 2),
			GambarURL: safeString(row, 3),
		})
	}
	return data, nil
}

func (s *SheetsService) GetModelByID(id string) (*models.ModelDekor, int, error) {
	modelsList, err := s.GetAllModels()
	if err != nil {
		return nil, 0, err
	}

	for i, m := range modelsList {
		if m.ID == id {
			return &m, i + 2, nil // +2 karena header dan 0-index
		}
	}
	return nil, 0, fmt.Errorf("model not found")
}

func (s *SheetsService) CreateModel(model models.ModelDekor) error {
	writeRange := "Model!A:E"
	var vr sheets.ValueRange
	vr.Values = append(vr.Values, []interface{}{
		model.ID,
		model.Nama,
		model.Deskripsi,
		model.GambarURL,
	})

	_, err := s.srv.Spreadsheets.Values.Append(s.spreadsheetID, writeRange, &vr).
		ValueInputOption("RAW").Do()
	return err
}

func (s *SheetsService) UpdateModel(id string, model models.ModelDekor) error {
	_, rowIdx, err := s.GetModelByID(id)
	if err != nil {
		return err
	}

	updateRange := fmt.Sprintf("Model!A%d:D%d", rowIdx, rowIdx)
	var vr sheets.ValueRange
	vr.Values = append(vr.Values, []interface{}{
		model.ID,
		model.Nama,
		model.Deskripsi,
		model.GambarURL,
	})

	_, err = s.srv.Spreadsheets.Values.Update(s.spreadsheetID, updateRange, &vr).
		ValueInputOption("RAW").Do()
	return err
}

func (s *SheetsService) DeleteModel(id string) error {
	_, rowIdx, err := s.GetModelByID(id)
	if err != nil {
		return err
	}

	sp, err := s.srv.Spreadsheets.Get(s.spreadsheetID).Do()
	if err != nil {
		return err
	}

	var sheetID int64
	for _, sheet := range sp.Sheets {
		if sheet.Properties.Title == "Model" {
			sheetID = sheet.Properties.SheetId
			break
		}
	}

	req := &sheets.BatchUpdateSpreadsheetRequest{
		Requests: []*sheets.Request{
			{
				DeleteDimension: &sheets.DeleteDimensionRequest{
					Range: &sheets.DimensionRange{
						SheetId:    sheetID, 
						Dimension:  "ROWS",
						StartIndex: int64(rowIdx - 1),
						EndIndex:   int64(rowIdx),
					},
				},
			},
		},
	}

	_, err = s.srv.Spreadsheets.BatchUpdate(s.spreadsheetID, req).Do()
	return err
}

// ============ HELPERS ============

func safeString(row []interface{}, idx int) string {
	if idx >= len(row) {
		return ""
	}
	return fmt.Sprintf("%v", row[idx])
}

func safeInt64(row []interface{}, idx int) int64 {
	s := safeString(row, idx)
	if s == "" {
		return 0
	}
	v, _ := strconv.ParseInt(s, 10, 64)
	return v
}
