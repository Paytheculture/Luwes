package models

import "time"

type User struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"password_hash,omitempty"`
	Nama         string `json:"nama"`
	Role         string `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type OrderItem struct {
	ID       string `json:"id,omitempty"`
	Nama     string `json:"nama"`
	Qty      int    `json:"qty"`
	Harga    int64  `json:"harga"`
	Gambar   string `json:"gambar,omitempty"`
	Kategori string `json:"kategori,omitempty"`
}

type Pesanan struct {
	ID             string      `json:"id"`
	NamaPengantin  string      `json:"nama_pengantin"`
	Alamat         string      `json:"alamat"`
	NoHP           string      `json:"no_hp"`
	TanggalPasang  string      `json:"tanggal_pasang"`
	TanggalBongkar string      `json:"tanggal_bongkar"`
	Items          []OrderItem `json:"items"`
	TotalHarga     int64       `json:"total_harga"`
	Status         string      `json:"status"`
	Catatan        string      `json:"catatan,omitempty"`
	CreatedAt      time.Time   `json:"created_at"`
}

type Item struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Harga     int64  `json:"harga"`
	GambarURL string `json:"gambar_url,omitempty"`
	Deskripsi string `json:"deskripsi,omitempty"`
	Kategori  string `json:"kategori,omitempty"`
}

type ModelDekor struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Deskripsi string `json:"deskripsi"`
	GambarURL string `json:"gambar_url"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
