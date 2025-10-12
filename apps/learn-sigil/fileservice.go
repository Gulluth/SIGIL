package main

import (
	"os"
)

// FileService provides file I/O operations for the frontend
type FileService struct{}

// NewFileService creates a new file service instance
func NewFileService() *FileService {
	return &FileService{}
}

// ReadFile reads the content of a file at the given path
func (f *FileService) ReadFile(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

// WriteFile writes content to a file at the given path
func (f *FileService) WriteFile(path string, content string) error {
	return os.WriteFile(path, []byte(content), 0644)
}
