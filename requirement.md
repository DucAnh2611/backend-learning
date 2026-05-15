# SecureVault — Backend Learning Project

Xây dựng hệ thống quản lý secrets / configuration / security cho nhiều ứng dụng bằng Node.js + ExpressJS + TypeScript (backend-focused)

---

# Tổng quan bạn sẽ học

- Backend architecture (ExpressJS)
- Authentication & Authorization (JWT + RBAC)
- Database design (PostgreSQL + TypeORM)
- Transaction handling
- Encryption & hashing
- API security
- Queue system
- Webhooks system
- Testing
- CLI tool

---

# CHECKPOINT 1 — Authentication

⏱ 2–3 days

## Mục đích
Xây nền tảng xác thực user để bảo vệ toàn bộ hệ thống.

## Nhiệm vụ

- Register user
- Login user
- JWT access token
- Refresh token
- Logout
- Hash password

## Tại sao cần làm

Toàn bộ hệ thống đều dựa vào user identity. Không có auth thì không thể phân quyền hay quản lý app.

## Dùng để làm gì

- Xác định user
- Bảo vệ API
- Nền cho RBAC và ownership

## Các checkpoint liên quan

- RBAC cần user
- App ownership
- API key gắn với user/app

---

# CHECKPOINT 2 — Role & Permission System

⏱ 3–5 days

## Mục đích
Xây hệ thống phân quyền theo action (permission-based), role chỉ là nhóm permissions.

## Nhiệm vụ

Permission:

```txt
config.read
config.write
apikey.rotate
member.invite
```

Role:

```txt
OWNER
ADMIN
MEMBER
```

Features:

- Gán role cho user trong app
- Middleware check permission
- Invite member

## Tại sao cần làm

Hệ thống multi-app cần kiểm soát quyền chi tiết theo hành động.

## Dùng để làm gì

- Authorization layer
- Control access per action
- Multi-tenant foundation

## Các checkpoint liên quan

- App ownership
- API key scope
- Config access control

---

# CHECKPOINT 3 — App Management

⏱ 1–2 days

## Mục đích
Tạo đơn vị trung tâm để phân tách dữ liệu theo app.

## Nhiệm vụ

- Create app
- Update app
- Delete app
- List apps

## Tại sao cần làm

Mỗi app là boundary cho config, keys, members.

## Dùng để làm gì

- Multi-app system
- Data isolation
- Ownership boundary

## Các checkpoint liên quan

- Auth xác định owner
- RBAC quản lý members
- API keys thuộc app
- Config thuộc app

---

# CHECKPOINT 4 — API Key Management

⏱ 3–5 days

## Mục đích
Machine-to-machine authentication.

## Nhiệm vụ

- Generate API key
- Rotate key
- Revoke key
- Expire key

## Rule quan trọng

- Secret chỉ show 1 lần
- DB chỉ lưu hash

## Tại sao cần làm

Không phải mọi request đều từ user.

## Dùng để làm gì

- SDK authentication
- Server-to-server access
- Secure API access

## Các checkpoint liên quan

- App scope
- RBAC permission scope
- Audit log tracking

---

# CHECKPOINT 5 — Encryption Service

⏱ 3–5 days

## Mục đích
Bảo vệ dữ liệu nhạy cảm ở database layer.

## Nhiệm vụ

- AES encryption
- Decryption
- Master key management

## Tại sao cần làm

DB leak không được lộ secrets.

## Dùng để làm gì

- Encrypt config secrets
- Protect API keys
- Secure storage layer

---

# CHECKPOINT 6 — Config Management

⏱ 4–6 days

## Mục đích
Quản lý key-value config theo từng app.

## Nhiệm vụ

- CRUD config
- ENV / JSON / SECRET
- Versioning
- Rollback

## Tại sao cần làm

Config thay đổi liên tục cần rollback an toàn.

## Dùng để làm gì

- App configuration
- Environment variables
- Feature flags

---

# CHECKPOINT 7 — Audit Log

⏱ 2–3 days

## Mục đích
Theo dõi toàn bộ hành vi quan trọng.

## Nhiệm vụ

Track:

- Login
- Config update
- Key rotation
- Secret access

## Tại sao cần làm

Security system bắt buộc phải có audit trail.

## Dùng để làm gì

- Debug production
- Security investigation
- Compliance tracking

---

# CHECKPOINT 8 — Export System

⏱ 2–4 days

## Mục đích
Export config an toàn.

## Nhiệm vụ

- Export JSON / ENV
- Password-protected export
- Export history

## Dùng để làm gì

- Backup config
- Move env dev → prod
- Share config securely

---

# CHECKPOINT 9 — API Security Layer

⏱ 2–4 days

## Mục đích
Bảo vệ hệ thống khỏi abuse.

## Nhiệm vụ

- Rate limit
- Helmet
- CORS
- API key middleware

## Dùng để làm gì

- Prevent abuse
- Stabilize API
- Protect endpoints

---

# CHECKPOINT 10 — App Relationship

⏱ 3–5 days

## Mục đích
Cho phép app liên kết và chia sẻ dữ liệu.

## Nhiệm vụ

- App handshake
- Shared secret
- Cross-app permission

## Dùng để làm gì

- Service-to-service communication
- Shared config system

---

# CHECKPOINT 11 — Queue System

⏱ 3–5 days

## Mục đích
Xử lý background jobs.

## Nhiệm vụ

- Key rotation jobs
- Export jobs
- Cleanup expired data

## Stack

- Redis
- BullMQ

## Dùng để làm gì

- Async processing
- Background tasks

---

# CHECKPOINT 12 — Webhook System

⏱ 4–6 days

## Mục đích
Cho phép user subscribe sự kiện, server tự động bắn webhook khi có thay đổi.

---

## Nhiệm vụ

### Webhook registration

- User tạo webhook URL
- Chọn event muốn subscribe

### Event types

```txt
config.created
config.updated
config.deleted

apikey.created
apikey.rotated
apikey.revoked

app.updated
member.invited
```

### Payload system

- Server tự build payload chuẩn
- Include:
  - event name
  - timestamp
  - appId
  - actor
  - data snapshot

### Delivery system

- HTTP POST webhook
- Custom headers (signature, event-type)
- Retry mechanism (exponential backoff)

### Failure handling

- Retry 3–5 lần
- Dead letter log nếu fail
- Log delivery history

---

## Tại sao cần làm

Trong hệ thống real-world:

- App không thể luôn poll data
- Webhook giúp real-time event notification
- Giảm coupling giữa services

---

## Dùng để làm gì

- Notify external systems
- Sync data giữa apps
- Event-driven architecture

---

## Các checkpoint liên quan

- Audit log feeds event
- Config changes trigger webhook
- API key lifecycle events
- Queue system xử lý retry delivery

---

## Tính năng đề xuất

- Webhook signing (HMAC)
- Retry delay config per webhook
- Webhook dashboard logs
- Disable/enable webhook
- Event filtering rules

---

# CHECKPOINT 13 — Testing

⏱ 3–5 days

## Mục đích
Đảm bảo hệ thống ổn định.

## Nhiệm vụ

- Unit test
- Integration test
- API test

---

# CHECKPOINT 14 — CLI Tool

⏱ 4–6 days

## Mục đích
Tương tác hệ thống qua terminal.

## Nhiệm vụ

```bash
vault login
vault pull-config
vault export
```

---

# CHECKPOINT 15 — Docker Deployment

⏱ 1–2 days

## Mục đích
Chạy system như production.

## Nhiệm vụ

- Docker setup
- Compose services

---
