package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"luwes-dekorasi-api/models"
	"luwes-dekorasi-api/services"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	cloudinary *services.CloudinaryService
}

func NewUploadHandler(cloudinary *services.CloudinaryService) *UploadHandler {
	return &UploadHandler{cloudinary: cloudinary}
}

func (h *UploadHandler) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "File tidak ditemukan",
		})
		return
	}
	defer file.Close()

	// Validate file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP",
		})
		return
	}

	// Max 5MB
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Ukuran file maksimal 5MB",
		})
		return
	}

	filename := fmt.Sprintf("dekorasi_%d", time.Now().UnixMilli())

	url, err := h.cloudinary.Upload(file, filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Gagal mengupload gambar",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Gambar berhasil diupload",
		Data:    gin.H{"url": url},
	})
}
