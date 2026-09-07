package handlers

import (
	"fmt"
	"net/http"
	"time"

	"luwes-dekorasi-api/models"
	"luwes-dekorasi-api/services"

	"github.com/gin-gonic/gin"
)

type ItemsHandler struct {
	sheets *services.SheetsService
}

func NewItemsHandler(sheets *services.SheetsService) *ItemsHandler {
	return &ItemsHandler{sheets: sheets}
}

func (h *ItemsHandler) GetAll(c *gin.Context) {
	items, err := h.sheets.GetAllItems()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal mengambil data item",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    items,
	})
}

func (h *ItemsHandler) Create(c *gin.Context) {
	var item models.Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Data item tidak valid",
		})
		return
	}

	item.ID = fmt.Sprintf("ITM-%d", time.Now().UnixMilli())

	if err := h.sheets.CreateItem(item); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal menyimpan item",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Item berhasil ditambahkan",
		Data:    item,
	})
}

func (h *ItemsHandler) Update(c *gin.Context) {
	id := c.Param("id")

	_, _, err := h.sheets.GetItemByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Item tidak ditemukan",
		})
		return
	}

	var item models.Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Data item tidak valid",
		})
		return
	}

	item.ID = id

	if err := h.sheets.UpdateItem(id, item); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal memperbarui item",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Item berhasil diperbarui",
		Data:    item,
	})
}

func (h *ItemsHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.sheets.DeleteItem(id); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal menghapus item",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Item berhasil dihapus",
	})
}
