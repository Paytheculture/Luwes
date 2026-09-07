package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"luwes-dekorasi-api/models"
	"luwes-dekorasi-api/services"

	"github.com/gin-gonic/gin"
)

type PesananHandler struct {
	sheets *services.SheetsService
}

func NewPesananHandler(sheets *services.SheetsService) *PesananHandler {
	return &PesananHandler{sheets: sheets}
}

func (h *PesananHandler) GetAll(c *gin.Context) {
	pesanan, err := h.sheets.GetAllPesanan()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal mengambil data pesanan",
		})
		return
	}

	// Filter by search query
	search := strings.ToLower(c.Query("search"))
	status := c.Query("status")

	var filtered []models.Pesanan
	for _, p := range pesanan {
		if search != "" && !strings.Contains(strings.ToLower(p.NamaPengantin), search) {
			continue
		}
		if status != "" && p.Status != status {
			continue
		}
		filtered = append(filtered, p)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    filtered,
	})
}

func (h *PesananHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	fmt.Printf("[GO BACKEND DEBUG] GetByID requested for ID: '%s'\n", id)

	pesanan, _, err := h.sheets.GetPesananByID(id)
	if err != nil {
		fmt.Printf("[GO BACKEND WARN] Pesanan ID '%s' NOT FOUND: %v\n", id, err)
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Pesanan tidak ditemukan",
		})
		return
	}

	fmt.Printf("[GO BACKEND SUCCESS] Found pesanan ID '%s', returning data.\n", id)
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    pesanan,
	})
}

func (h *PesananHandler) Create(c *gin.Context) {
	var pesanan models.Pesanan
	if err := c.ShouldBindJSON(&pesanan); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Data pesanan tidak valid",
		})
		return
	}

	pesanan.ID = fmt.Sprintf("PSN-%d", time.Now().UnixMilli())
	pesanan.CreatedAt = time.Now()

	if pesanan.Status == "" {
		pesanan.Status = "Pending"
	}

	// Calculate total
	var total int64
	for _, item := range pesanan.Items {
		total += item.Harga * int64(item.Qty)
	}
	pesanan.TotalHarga = total

	if err := h.sheets.CreatePesanan(pesanan); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal menyimpan pesanan",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Pesanan berhasil dibuat",
		Data:    pesanan,
	})
}

func (h *PesananHandler) Update(c *gin.Context) {
	id := c.Param("id")

	existing, _, err := h.sheets.GetPesananByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Pesanan tidak ditemukan",
		})
		return
	}

	var pesanan models.Pesanan
	if err := c.ShouldBindJSON(&pesanan); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Data pesanan tidak valid",
		})
		return
	}

	pesanan.ID = id
	pesanan.CreatedAt = existing.CreatedAt

	// Recalculate total
	var total int64
	for _, item := range pesanan.Items {
		total += item.Harga * int64(item.Qty)
	}
	pesanan.TotalHarga = total

	if err := h.sheets.UpdatePesanan(id, pesanan); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal memperbarui pesanan",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pesanan berhasil diperbarui",
		Data:    pesanan,
	})
}

func (h *PesananHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.sheets.DeletePesanan(id); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal menghapus pesanan",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pesanan berhasil dihapus",
	})
}
