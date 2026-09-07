package handlers

import (
	"net/http"

	"luwes-dekorasi-api/models"
	"luwes-dekorasi-api/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ModelsHandler struct {
	sheets *services.SheetsService
}

func NewModelsHandler(sheets *services.SheetsService) *ModelsHandler {
	return &ModelsHandler{sheets: sheets}
}

func (h *ModelsHandler) GetAll(c *gin.Context) {
	data, err := h.sheets.GetAllModels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    data,
	})
}

func (h *ModelsHandler) Create(c *gin.Context) {
	var model models.ModelDekor
	if err := c.ShouldBindJSON(&model); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	model.ID = "MDL-" + uuid.New().String()[:8]

	if err := h.sheets.CreateModel(model); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Model dekorasi berhasil ditambahkan",
	})
}

func (h *ModelsHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var model models.ModelDekor
	if err := c.ShouldBindJSON(&model); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	model.ID = id

	if err := h.sheets.UpdateModel(id, model); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Model dekorasi berhasil diperbarui",
	})
}

func (h *ModelsHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.sheets.DeleteModel(id); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Model dekorasi berhasil dihapus",
	})
}
