package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryService struct {
	cld *cloudinary.Cloudinary
}

func NewCloudinaryService() (*CloudinaryService, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return nil, fmt.Errorf("cloudinary env vars not set")
	}

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, err
	}

	return &CloudinaryService{cld: cld}, nil
}

func (c *CloudinaryService) Upload(file multipart.File, filename string) (string, error) {
	ctx := context.Background()

	result, err := c.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:   "luwes-dekorasi",
		PublicID: filename,
	})
	if err != nil {
		return "", err
	}

	return result.SecureURL, nil
}

func (c *CloudinaryService) Delete(publicID string) error {
	ctx := context.Background()
	_, err := c.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	return err
}
