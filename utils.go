package main

import "math/rand"

var RandomStringRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func RandomString(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = RandomStringRunes[rand.Intn(len(RandomStringRunes))]
	}
	return string(b)
}
