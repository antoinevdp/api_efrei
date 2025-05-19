# Albums & Photos API

## 📋 Overview

This RESTful API manages a collection of **albums** and their associated **photos**. It is designed as a microservice using Node.js, Express, and MongoDB.

---

## Endpoints

### \[POST] Create an Album

Allows the creation of a new album.

|                          |                    |
| ------------------------ | ------------------ |
| Requires authentication? | No                 |
| Who can use it?          | Anyone             |
| Response format          | `application/json` |

**HTTP request** : `POST /album/`

#### Body :

```json
{
  "title": "My Album",
  "description": "Summer vacation"
}
```

#### Response :

```json
{
  "id": "664adf...cba",
  "title": "My Album",
  "description": "Summer vacation",
  "photos": [],
  "created_at": "2025-05-19T12:34:56.789Z"
}
```

---

### \[GET] Show an Album by ID

Returns a specific album with its photos.

* **HTTP request** : `GET /album/:id`

#### Response :

```json
{
  "id": "664adf...cba",
  "title": "My Album",
  "description": "Summer vacation",
  "photos": [
    {
      "id": "665a...",
      "title": "Beach",
      "url": "https://...",
      "description": "Sunset",
      "created_at": "..."
    }
  ]
}
```

---

### \[DELETE] Delete an Album

* **HTTP request** : `DELETE /album/:id`

---

### \[GET] Search Albums by Title

* **HTTP request** : `GET /albums/?title=vacation`

---

### \[POST] Add a Photo to an Album

* **HTTP request** : `POST /album/:idalbum/photo`

#### Body :

```json
{
  "title": "Beach",
  "url": "https://...",
  "description": "Sunset"
}
```

#### Response :

```json
{
  "id": "665a...",
  "title": "Beach",
  "url": "https://...",
  "description": "Sunset",
  "album": "664adf...cba"
}
```

---

###  \[GET] Get All Photos in an Album

* **HTTP request** : `GET /album/:idalbum/photos/`

---

###  \[GET] Get a Photo by ID

* **HTTP request** : `GET /album/:idalbum/photo/:idphoto`

---

### ️ \[PUT] Update a Photo

* **HTTP request** : `PUT /album/:idalbum/photo/:idphoto`

#### Body (example) :

```json
{
  "title": "Updated title"
}
```

---

### ️ \[DELETE] Delete a Photo

* **HTTP request** : `DELETE /album/:idalbum/photo/:idphoto`

---

## ️ Requirements

* Node.js v18
* npm / yarn / pnpm
* Git
* MongoDB (configure `config.js` with your MongoDB connection string)

---

## Install

```bash
npm install
```

## Production mode

```bash
npm run prod
```

## Development mode

```bash
npm run dev
```
