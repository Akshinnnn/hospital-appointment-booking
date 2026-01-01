# Hospital Booking System - Backend Documentation

A comprehensive microservices-based hospital booking system built with .NET 9.0, implementing Clean Architecture principles and Domain-Driven Design patterns. The system enables patients to book appointments with doctors, manage medical records, and receive automated notifications.

## Table of Contents

- [Features](#features)
- [Event Storming](#event-storming)
- [Clean Architecture Overview](#clean-architecture-overview)
- [Interaction Flow and Architecture](#interaction-flow-and-architecture)
- [Domain-Driven Design Principles and Patterns](#domain-driven-design-principles-and-patterns)
- [Design Patterns Used](#design-patterns-used)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)

---

## Features

The Hospital Booking System provides the following core capabilities:

### Authentication & Authorization
- **JWT-based authentication** with role-based access control (RBAC)
- Support for three user roles: `PATIENT`, `DOCTOR`, and `ADMIN`
- Secure password hashing using BCrypt
- Token-based API access with configurable expiration

### User Management
- User registration and login
- User profile management
- Doctor profile creation with specializations
- Doctor schedule management with availability slots
- Redis-based caching for doctor specializations and listings

### Appointment Management
- Appointment booking with unique appointment number generation
- Appointment status tracking (APPROVED, CANCELLED)
- Conflict detection to prevent double-booking
- Appointment retrieval by patient or doctor
- Appointment cancellation with event notifications

### Medical Records Management
- Secure medical record upload to Google Cloud Storage
- Signed URL generation for secure file access (15-minute expiration)
- Medical record metadata management (title, description, file information)
- Role-based record access (patients see their records, doctors see records they created)
- Automatic patient notifications when records are created

### Notification System
- **Event-driven email notifications** via RabbitMQ
- Appointment confirmation emails with detailed appointment information
- Medical record creation notifications
- Asynchronous processing to ensure system responsiveness
- Graceful error handling to prevent notification failures from affecting core operations

### API Gateway
- **YARP (Yet Another Reverse Proxy)** for unified API access
- Request routing to appropriate microservices
- Centralized authentication and authorization
- CORS configuration for frontend integration
- OpenAPI documentation support

---

## Event Storming

Event Storming reveals the domain events and business processes that drive the system's behavior. The system uses an event-driven architecture where domain events trigger downstream processes.

### Domain Events

#### AppointmentCreated
**Triggered when:** A new appointment is successfully created  
**Published by:** AppointmentService  
**Queue:** `appointment-created`  
**Consumed by:** NotificationService  
**Payload:**
- Appointment ID
- Appointment Number
- Patient Information (FullName, Email)
- Doctor ID
- Appointment Time
- Status
- Notes (optional)

**Business Process:**
1. Patient or anonymous user creates appointment
2. AppointmentService validates and persists appointment
3. Unique appointment number is generated (format: `APT-YYYYMMDD-HHMMSS-XXXX`)
4. Event is published to RabbitMQ
5. NotificationService consumes event and sends confirmation email

#### AppointmentCancelled
**Triggered when:** An appointment is cancelled  
**Published by:** AppointmentService  
**Queue:** `appointment-cancelled`  
**Consumed by:** NotificationService (future enhancement)  
**Business Process:**
1. User requests appointment cancellation
2. AppointmentService updates status to CANCELLED
3. Event is published for potential notification or analytics

#### MedicalRecordCreated
**Triggered when:** A doctor uploads a medical record for a patient  
**Published by:** MedicalRecordsService  
**Queue:** `medical-record-created`  
**Consumed by:** NotificationService  
**Payload:**
- Record ID
- Patient ID
- Patient Email
- Doctor ID
- Title
- Description
- File Path
- File Name
- Created At

**Business Process:**
1. Doctor uploads medical record file
2. File is uploaded to Google Cloud Storage
3. Record metadata is persisted in database
4. Event is published to RabbitMQ
5. NotificationService fetches patient email and sends notification

---

## Clean Architecture Overview

The system follows Clean Architecture principles, organizing code into layers with clear dependency rules. Each microservice maintains its own layered structure, ensuring separation of concerns and testability.


### Dependency Flow

**Rule:** Dependencies point inward. Outer layers depend on inner layers, but inner layers never depend on outer layers.

- **Controllers** depend on **Services** and **DTOs**
- **Services** depend on **Repositories** and **Domain Entities**
- **Repositories** depend on **DbContext** and **Entities**
- **Entities** have no dependencies (pure domain models)

### Layer Responsibilities

#### Controllers Layer
- Handle HTTP requests and responses
- Validate authorization and roles
- Map between HTTP and application models
- Return standardized API responses

#### Services Layer
- Implement business logic and rules
- Orchestrate operations across repositories
- Handle domain events (publish to message queue)
- Perform cross-service communication
- Apply validation and business rules

#### Repositories Layer
- Abstract data access implementation
- Provide query methods for entities
- Handle CRUD operations
- Encapsulate Entity Framework usage

#### Data Layer
- Define database context (DbContext)
- Configure Entity Framework mappings
- Handle database migrations
- Manage connection strings and database configuration

---

## Interaction Flow and Architecture

The system architecture follows a microservices pattern with an API Gateway, event-driven communication, and database-per-service isolation.

### Service Communication Patterns

#### Synchronous Communication (HTTP)
- **ApiGateway → Services:** Request routing with authentication
- **AppointmentService → UserService:** Fetch doctor information for appointment details
- **MedicalRecordsService → UserService:** Fetch patient email for notifications
- **NotificationService → UserService:** Fetch user details for email personalization

#### Asynchronous Communication (RabbitMQ)
- **AppointmentService → NotificationService:** Appointment creation events
- **MedicalRecordsService → NotificationService:** Medical record creation events
- **Future:** Appointment cancellation events, schedule change notifications

### Database Per Service Pattern

Each microservice maintains its own database schema:

- **UserService:** `Users`, `Doctor_Schedules`, `Slots`
- **AppointmentService:** `Appointments`
- **MedicalRecordsService:** `Records`

This ensures:
- Service independence and autonomy
- Data isolation and security
- Independent scaling
- Technology diversity (though all currently use PostgreSQL)

---

## Domain-Driven Design Principles and Patterns

The system applies Domain-Driven Design (DDD) principles to model the hospital booking domain accurately and maintain clear boundaries between services.

### Bounded Contexts

Each microservice represents a distinct bounded context with its own domain model:

#### User Management Context (UserService)
**Responsibility:** User identity, authentication, doctor profiles, and schedules  
**Entities:**
- `User` (Aggregate Root)
- `DoctorSchedule` (Entity)
- `Slot` (Value Object)

**Ubiquitous Language:**
- User, Patient, Doctor, Admin
- Schedule, Availability, Slot
- Specialization

#### Appointment Context (AppointmentService)
**Responsibility:** Appointment booking, scheduling, and lifecycle management  
**Entities:**
- `Appointment` (Aggregate Root)

**Ubiquitous Language:**
- Appointment, Appointment Number
- Appointment Time, Status
- Conflict, Double-booking

#### Medical Records Context (MedicalRecordsService)
**Responsibility:** Medical record storage, retrieval, and access control  
**Entities:**
- `Record` (Aggregate Root)

**Ubiquitous Language:**
- Medical Record, Record
- File Upload, Signed URL
- Patient Record, Doctor Record

#### Notification Context (NotificationService)
**Responsibility:** Asynchronous notification delivery  
**Entities:**
- `AppointmentCreatedMessage` (Domain Event)
- `MedicalRecordCreatedMessage` (Domain Event)

**Ubiquitous Language:**
- Notification, Email
- Confirmation, Alert

### Domain Entities

#### User (Aggregate Root)
```csharp
- Id: Guid
- Full_Name: string
- Email: string (unique)
- Phone_Number: string?
- Password: string (hashed)
- Role: UserRole (PATIENT | DOCTOR | ADMIN)
- Specialisation: string? (for doctors)
- Created_At: DateTime
- Availabilities: ICollection<DoctorSchedule>
```

**Business Rules:**
- Email must be unique across all users
- Password is hashed using BCrypt
- Doctors can have multiple schedules
- Role determines access permissions

#### Appointment (Aggregate Root)
```csharp
- Id: Guid
- FullName: string
- Email: string
- DoctorId: Guid
- PatientId: Guid? (nullable for anonymous bookings)
- AppointmentTime: DateTime
- Status: AppointmentStatus (APPROVED | CANCELLED)
- AppointmentNumber: string (unique, format: APT-YYYYMMDD-HHMMSS-XXXX)
- Notes: string?
- CreatedAt: DateTime
```

**Business Rules:**
- AppointmentNumber must be unique
- Cannot book same doctor at same time (unless cancelled)
- Status transitions: APPROVED → CANCELLED
- PatientId is optional to support anonymous bookings

#### Record (Aggregate Root)
```csharp
- Id: Guid
- Patient_Id: Guid
- Doctor_Id: Guid
- Title: string?
- Description: string?
- FilePath: string? (Google Cloud Storage URL)
- FileName: string?
- ContentType: string?
- CreatedAt: DateTime
```

**Business Rules:**
- File must be uploaded to Google Cloud Storage before record creation
- Signed URLs expire after 15 minutes
- Only the creating doctor or the patient can access records

#### DoctorSchedule (Entity)
```csharp
- Id: Guid
- Doctor_Id: Guid
- Start_Time: DateTime
- End_Time: DateTime
- Doctor: User (navigation property)
```

**Business Rules:**
- End_Time must be after Start_Time
- Schedules belong to a single doctor
- Used to determine doctor availability

### Value Objects

#### AppointmentNumber
- Format: `APT-YYYYMMDD-HHMMSS-XXXX`
- Generated uniquely per appointment
- Used for patient reference and lookup

#### AppointmentStatus
- Enum: `APPROVED`, `CANCELLED`
- Immutable state transitions
- Business logic enforces valid transitions

#### UserRole
- Enum: `PATIENT`, `DOCTOR`, `ADMIN`
- Determines authorization rules
- Set during user creation/registration

### Domain Events

Domain events represent significant business occurrences:

1. **AppointmentCreated** - Published when appointment is successfully booked
2. **AppointmentCancelled** - Published when appointment is cancelled
3. **MedicalRecordCreated** - Published when doctor uploads a medical record

These events enable:
- Loose coupling between services
- Eventual consistency
- Audit trails
- Integration with external systems

### Aggregate Boundaries

Each aggregate root maintains transactional consistency within its boundary:

- **User Aggregate:** User data and related schedules
- **Appointment Aggregate:** Single appointment with its lifecycle
- **Record Aggregate:** Single medical record with file metadata

Cross-aggregate operations use eventual consistency via domain events.

---

## Design Patterns Used

The system employs several well-established design patterns to achieve maintainability, testability, and scalability.

### Repository Pattern

**Purpose:** Abstract data access logic and provide a clean interface for data operations.

**Implementation:**
- `IAppointmentRepository` / `AppointmentRepository`
- `IUserRepository` / `UserRepository`
- `IRecordRepository` / `RecordRepository`
- `IDoctorRepository` / `DoctorRepository`
- `IScheduleRepository` / `ScheduleRepository`
- `ISlotRepository` / `SlotRepository`

**Benefits:**
- Decouples business logic from data access
- Enables easy testing with mock repositories
- Provides consistent data access interface
- Allows switching data access technologies

**Example:**
```csharp
public interface IAppointmentRepository
{
    Task<List<Appointment>> GetAllAsync();
    Task<Appointment?> GetByIdAsync(Guid id);
    Task CreateAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
    Task DeleteAsync(Guid id);
    Task<List<Appointment>> GetByExpression(Expression<Func<Appointment, bool>> expression);
}
```

### Service Layer Pattern

**Purpose:** Encapsulate business logic and orchestrate operations across repositories.

**Implementation:**
- `IAppointmentService` / `AppointmentService`
- `IUserService` / `UserService`
- `IRecordService` / `RecordService`
- `IDoctorService` / `DoctorService`
- `IScheduleService` / `ScheduleService`

**Benefits:**
- Centralizes business rules
- Coordinates multiple repositories
- Handles cross-cutting concerns (logging, events)
- Provides transaction boundaries

**Example:**
```csharp
public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repository;
    private readonly IRabbitMqProducer _producer;
    
    public async Task<ApiResponse<AppointmentDTO>> CreateAsync(...)
    {
        // Business logic: conflict checking
        // Repository: data persistence
        // Event: publish to message queue
    }
}
```

### DTO (Data Transfer Object) Pattern

**Purpose:** Separate API contracts from domain entities, preventing over-exposure of internal models.

**Implementation:**
- `AppointmentDTO`, `AppointmentCreateDTO`
- `UserDTO`, `RegisterDTO`, `LoginDTO`, `UpdateDTO`
- `RecordDTO`, `AddRecordDTO`, `UpdateRecordDTO`

**Benefits:**
- API versioning flexibility
- Hides internal domain structure
- Allows different representations for different consumers
- Prevents over-posting attacks

**Example:**
```csharp
public class AppointmentCreateDTO
{
    public Guid DoctorId { get; set; }
    public DateTime AppointmentTime { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string? Notes { get; set; }
}
```

### API Gateway Pattern

**Purpose:** Provide a single entry point for clients, routing requests to appropriate microservices.

**Implementation:**
- YARP (Yet Another Reverse Proxy) in `ApiGateway` service
- Centralized authentication and authorization
- Request routing based on path patterns

**Benefits:**
- Simplifies client integration
- Centralizes cross-cutting concerns
- Enables service composition
- Provides unified API surface

### Event-Driven Architecture Pattern

**Purpose:** Enable loose coupling and asynchronous communication between services.

**Implementation:**
- RabbitMQ as message broker
- `RabbitMqProducer` for publishing events
- `RabbitMqConsumer` (BackgroundService) for consuming events
- Domain events: `AppointmentCreated`, `MedicalRecordCreated`

**Benefits:**
- Decouples services
- Enables eventual consistency
- Improves scalability
- Supports event sourcing (future)

### Caching Strategy Pattern

**Purpose:** Improve performance by reducing database load for frequently accessed data.

**Implementation:**
- Redis for distributed caching
- Used in `DoctorService` for:
  - Doctor listings by specialization (15-minute TTL)
  - All specializations list (30-minute TTL)

**Benefits:**
- Reduces database queries
- Improves response times
- Scales horizontally
- Configurable expiration policies

**Example:**
```csharp
public async Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation)
{
    var cacheKey = $"doctor_{specialisation.ToLower()}";
    var cachedData = await _cache.GetStringAsync(cacheKey);
    
    if (!string.IsNullOrEmpty(cachedData))
        return JsonSerializer.Deserialize<List<User>>(cachedData)!;
    
    var doctors = await _doctorRepository.GetDoctorsBySpecialisationAsync(specialisation);
    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(doctors), cacheOptions);
    return doctors;
}
```

### Dependency Injection Pattern

**Purpose:** Achieve loose coupling and improve testability through inversion of control.

**Implementation:**
- .NET built-in DI container
- Service registration in `Program.cs`
- Constructor injection throughout

**Benefits:**
- Loose coupling between components
- Easy testing with mocks
- Centralized configuration
- Lifecycle management (Singleton, Scoped, Transient)

### Middleware Pattern

**Purpose:** Handle cross-cutting concerns in the request pipeline.

**Implementation:**
- `ExceptionMiddleware` for global error handling
- Standardized error responses
- Logging integration

**Benefits:**
- Centralized error handling
- Consistent error responses
- Request/response logging
- Pipeline customization

**Example:**
```csharp
public class ExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(
                ApiResponse<string>.Fail("Internal server error"));
        }
    }
}
```

### Factory Pattern

**Purpose:** Create objects without specifying exact classes.

**Implementation:**
- `IHttpClientFactory` for HTTP client creation
- `StorageClient` factory for Google Cloud Storage

**Benefits:**
- Manages object lifecycle
- Prevents resource leaks
- Enables pooling and reuse

### Strategy Pattern

**Purpose:** Define a family of algorithms and make them interchangeable.

**Implementation:**
- Different validation strategies via FluentValidation
- Different authentication strategies (JWT Bearer)
- Different storage strategies (Google Cloud Storage)

---

## Technologies Used

### Core Framework & Runtime
- **.NET 9.0** - Modern, high-performance framework for building cloud-native applications
- **C# 12** - Latest C# language features

### Web Framework
- **ASP.NET Core 9.0** - Web framework for building RESTful APIs
- **YARP (Yet Another Reverse Proxy) 2.3.0** - High-performance reverse proxy for API Gateway

### Database & ORM
- **PostgreSQL 14.2** - Robust, open-source relational database
- **Entity Framework Core 9.0.7** - Object-relational mapping framework
- **Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4** - PostgreSQL provider for EF Core

### Message Broker
- **RabbitMQ 3-management** - Message broker for event-driven communication
- **RabbitMQ.Client 6.8.1** - .NET client library for RabbitMQ

### Caching
- **Redis 7.4-alpine** - In-memory data structure store
- **StackExchange.Redis 2.9.32** - High-performance Redis client
- **Microsoft.Extensions.Caching.StackExchangeRedis 9.0.9** - Redis caching extensions

### Authentication & Security
- **Microsoft.AspNetCore.Authentication.JwtBearer 9.0.7** - JWT authentication middleware
- **BCrypt.Net-Next 4.0.3** - Password hashing library

### Cloud Storage
- **Google.Cloud.Storage.V1 4.13.0** - Google Cloud Storage client library

### Object Mapping
- **AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.1** - Object-to-object mapping library

### Validation
- **FluentValidation 12.1.0** - Validation library using fluent interface
- **FluentValidation.AspNetCore 11.3.1** - ASP.NET Core integration for FluentValidation

### Email
- **MailKit** - Cross-platform mail library (via SMTP)

### API Documentation
- **Microsoft.AspNetCore.OpenApi 9.0.2** - OpenAPI support
- **Swashbuckle.AspNetCore 9.0.3** - Swagger/OpenAPI tooling (in some services)

### Containerization
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker application orchestration

### Development Tools
- **Microsoft.EntityFrameworkCore.Design 9.0.7** - EF Core design-time tools
- **Npgsql.EntityFrameworkCore.PostgreSQL.Design 1.1.0** - Design-time support for PostgreSQL

### Additional Libraries
- **Confluent.Kafka 2.11.1** - Kafka client (in UserService, for future use)
- **MassTransit.AspNetCore 7.3.1** - Message bus abstraction (in MedicalRecordsService, for future use)
- **MassTransit.Kafka 8.5.1** - Kafka integration for MassTransit (in MedicalRecordsService)

---

## Getting Started

### Prerequisites

Before running the system, ensure you have the following installed:

- **.NET 9.0 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** - Usually included with Docker Desktop
- **Google Cloud Platform Account** (for medical records storage)
  - GCP project with Cloud Storage enabled
  - Service account credentials JSON file

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hospitalbooking
   ```

2. **Configure Google Cloud Storage:**
   - Create a GCP project and enable Cloud Storage API
   - Create a service account and download credentials JSON
   - Place the credentials file in:
     - `backend/MedicalRecordsService/Secrets/gcp-credentials.json`
     - `backend/UserService/Secrets/gcp-credentials.json` (if used)

3. **Configure Environment Variables:**
   
   Create a `.env` file in the project root (or set environment variables):
   ```env
   PROJECT_NAME=hospitalbooking
   POSTGRES_PASSWORD=your_secure_password
   ```

4. **Configure Service Settings:**
   
   Each service has `appsettings.json` and `appsettings.Development.json`. Key configurations:

   **UserService/appsettings.json:**
   ```json
   {
     "ConnectionStrings": {
       "Default": "Host=postgres;Port=5432;Database=userservice_db;Username=postgres;Password=${POSTGRES_PASSWORD}",
       "Redis": "redis:6379,password=P3d!sP@ssw0rd2025!"
     },
     "JwtSettings": {
       "Issuer": "http://userservice:8080",
       "Audience": "HospitalBooking",
       "Secret": "your_jwt_secret_key_min_32_characters",
       "ExpiryMinutes": "60"
     },
     "RabbitMQ": {
       "HostName": "rabbitmq",
       "UserName": "guest",
       "Password": "guest"
     }
   }
   ```

   **AppointmentService/appsettings.json:**
   ```json
   {
     "ConnectionStrings": {
       "Default": "Host=postgres;Port=5432;Database=appointmentservice_db;Username=postgres;Password=${POSTGRES_PASSWORD}"
     },
     "JwtSettings": {
       "Issuer": "http://userservice:8080",
       "Audience": "HospitalBooking",
       "Secret": "your_jwt_secret_key_min_32_characters"
     },
     "RabbitMQ": {
       "HostName": "rabbitmq",
       "UserName": "guest",
       "Password": "guest"
     },
     "UserService": {
       "BaseUrl": "http://userservice:8080"
     }
   }
   ```

   **MedicalRecordsService/appsettings.json:**
   ```json
   {
     "ConnectionStrings": {
       "Default": "Host=postgres;Port=5432;Database=medicalrecordservice_db;Username=postgres;Password=${POSTGRES_PASSWORD}"
     },
     "GoogleCloud": {
       "BucketName": "your-gcs-bucket-name",
       "CredentialsPath": "Secrets/gcp-credentials.json"
     },
     "JwtSettings": {
       "Issuer": "http://userservice:8080",
       "Audience": "HospitalBooking",
       "Secret": "your_jwt_secret_key_min_32_characters"
     },
     "RabbitMQ": {
       "HostName": "rabbitmq",
       "UserName": "guest",
       "Password": "guest"
     },
     "UserService": {
       "BaseUrl": "http://userservice:8080"
     }
   }
   ```

   **NotificationService/appsettings.json:**
   ```json
   {
     "RabbitMQ": {
       "HostName": "rabbitmq",
       "UserName": "guest",
       "Password": "guest"
     },
     "EmailSettings": {
       "SmtpHost": "smtp.gmail.com",
       "SmtpPort": "587",
       "SmtpUsername": "your_email@gmail.com",
       "SmtpPassword": "your_app_password",
       "SenderEmail": "noreply@hospitalbooking.com",
       "SenderName": "Hospital Booking System"
     },
     "UserService": {
       "BaseUrl": "http://userservice:8080"
     }
   }
   ```

   **ApiGateway/appsettings.json:**
   - Already configured with routing rules
   - JWT validation points to UserService

### Running with Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f userservice
   docker-compose logs -f appointmentservice
   ```

3. **Check service health:**
   ```bash
   # API Gateway
   curl http://localhost:8080
   
   # UserService
   curl http://localhost:8081
   
   # AppointmentService
   curl http://localhost:8082
   
   # MedicalRecordsService
   curl http://localhost:8083
   
   # NotificationService
   curl http://localhost:8084/health
   ```

4. **Access management interfaces:**
   - **RabbitMQ Management:** http://localhost:15672 (guest/guest)
   - **PostgreSQL:** localhost:5432 (postgres/${POSTGRES_PASSWORD})
   - **Redis:** localhost:6379 (password: P3d!sP@ssw0rd2025!)

### Database Migrations

Migrations are automatically applied on service startup via `Program.cs`:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppointmentsDbContext>();
    db.Database.Migrate();
}
```

To create new migrations manually:

```bash
# Navigate to service directory
cd backend/AppointmentService

# Add migration
dotnet ef migrations add MigrationName --project . --startup-project .

# Update database
dotnet ef database update --project . --startup-project .
```

### Running Services Individually (Development)

For local development without Docker:

1. **Start infrastructure services:**
   ```bash
   docker-compose up postgres rabbitmq redis -d
   ```

2. **Run services:**
   ```bash
   # Terminal 1 - UserService
   cd backend/UserService
   dotnet run
   
   # Terminal 2 - AppointmentService
   cd backend/AppointmentService
   dotnet run
   
   # Terminal 3 - MedicalRecordsService
   cd backend/MedicalRecordsService
   dotnet run
   
   # Terminal 4 - NotificationService
   cd backend/NotificationService
   dotnet run
   
   # Terminal 5 - ApiGateway
   cd backend/ApiGateway
   dotnet run
   ```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Project Structure

The backend is organized as a microservices solution with each service following a consistent structure.

### Solution Structure

```
backend/
├── ApiGateway/                 # API Gateway service
├── UserService/                 # User management service
├── AppointmentService/         # Appointment booking service
├── MedicalRecordsService/      # Medical records service
├── NotificationService/         # Notification service
└── HospitalBooking.sln         # Solution file
```

### Service Structure (Common Pattern)

Each microservice follows this structure:

```
ServiceName/
├── Controllers/                # API controllers (HTTP endpoints)
│   └── [Entity]Controller.cs
├── Services/                   # Business logic layer
│   ├── I[Entity]Service.cs    # Service interface
│   ├── [Entity]Service.cs     # Service implementation
│   └── Repositories/          # Data access layer
│       ├── I[Entity]Repository.cs
│       └── [Entity]Repository.cs
├── Models/                     # Data models
│   ├── DTOs/                  # Data Transfer Objects
│   ├── Entities/              # Domain entities
│   └── Responses/             # API response models
├── Data/                       # Database context
│   └── [Service]DbContext.cs
├── Messaging/                  # Message queue integration
│   ├── RabbitMqProducer.cs
│   └── RabbitMqConsumer.cs
├── Middleware/                 # Custom middleware
│   └── ExceptionMiddleware.cs
├── Mapping/                    # AutoMapper profiles
│   └── [Service]Profile.cs
├── Validators/                 # FluentValidation validators
│   └── [Entity]Validator.cs
├── Migrations/                 # Entity Framework migrations
├── Properties/
│   └── launchSettings.json
├── appsettings.json            # Production configuration
├── appsettings.Development.json
├── Program.cs                  # Application entry point
├── Dockerfile                  # Docker configuration
└── [Service].csproj           # Project file
```

### ApiGateway Structure

```
ApiGateway/
├── Program.cs                  # YARP configuration
├── appsettings.json           # Reverse proxy routes
└── ApiGateway.csproj
```

**Key Files:**
- `Program.cs` - Configures YARP reverse proxy, CORS, JWT authentication
- `appsettings.json` - Defines route patterns and cluster destinations

### UserService Structure

```
UserService/
├── Controllers/
│   ├── AuthController.cs      # Login, Register
│   ├── AccountController.cs   # Profile management
│   ├── ScheduleController.cs  # Doctor schedules
│   ├── DoctorController.cs    # Doctor operations
│   └── UserController.cs      # Admin user management
├── Services/
│   ├── UserService.cs         # User business logic
│   ├── DoctorService.cs       # Doctor operations with caching
│   ├── ScheduleService.cs     # Schedule management
│   └── Repositories/
│       ├── UserRepository.cs
│       ├── DoctorRepository.cs
│       ├── ScheduleRepository.cs
│       └── SlotRepository.cs
├── Models/
│   ├── DTOs/                  # RegisterDTO, LoginDTO, UserDTO, etc.
│   ├── Entities/              # User, DoctorSchedule, Slot
│   └── Responses/             # ApiResponse<T>
├── Data/
│   ├── UsersDbContext.cs
│   └── DbInitializer.cs      # Seed data
├── Messaging/
│   └── RabbitMqConsumer.cs   # Consumes events (if any)
├── GoogleCloudConfiguration/
│   └── GoogleCloudConfig.cs
└── Validators/
    └── RegisterValidator.cs
```

**Key Responsibilities:**
- User authentication and authorization
- JWT token generation
- Doctor profile management
- Schedule and availability management
- Redis caching for doctor listings

### AppointmentService Structure

```
AppointmentService/
├── Controllers/
│   └── AppointmentsController.cs
├── Services/
│   ├── AppointmentService.cs  # Core business logic
│   └── Repositories/
│       └── AppointmentRepository.cs
├── Models/
│   ├── DTOs/
│   │   ├── AppointmentDTO.cs
│   │   └── AppointmentCreateDTO.cs
│   ├── Entities/
│   │   ├── Appointment.cs
│   │   └── AppointmentStatus.cs
│   └── Responses/
│       └── ApiResponse.cs
├── Data/
│   └── AppointmentsDbContext.cs
├── Messaging/
│   └── RabbitMqProducer.cs   # Publishes AppointmentCreated
├── Mapping/
│   └── AppointmentProfile.cs
└── Validators/
    └── AppointmentValidator.cs
```

**Key Responsibilities:**
- Appointment creation with conflict detection
- Unique appointment number generation
- Appointment lifecycle management
- Event publishing for notifications
- Cross-service communication (fetching doctor info)

### MedicalRecordsService Structure

```
MedicalRecordsService/
├── Controllers/
│   └── RecordsController.cs
├── Services/
│   ├── RecordService.cs       # File upload, GCS integration
│   └── Repositories/
│       └── RecordRepository.cs
├── Models/
│   ├── DTOs/
│   │   ├── AddRecordDTO.cs
│   │   └── UpdateRecordDTO.cs
│   ├── Entities/
│   │   └── Record.cs
│   └── Responses/
│       └── ApiResponse.cs
├── Data/
│   └── RecordDbContext.cs
├── GoogleCloudConfiguration/
│   └── GoogleCloudConfig.cs
├── Messaging/
│   └── RabbitMqProducer.cs   # Publishes MedicalRecordCreated
├── Secrets/
│   └── gcp-credentials.json  # GCP service account (not in repo)
└── Validators/
    └── RecordValidator.cs
```

**Key Responsibilities:**
- Medical record file upload to Google Cloud Storage
- Signed URL generation for secure access
- Record metadata management
- Event publishing for notifications

### NotificationService Structure

```
NotificationService/
├── Services/
│   ├── EmailService.cs        # SMTP email sending
│   └── IEmailService.cs
├── Messaging/
│   └── RabbitMqConsumer.cs   # BackgroundService consuming events
├── Models/
│   ├── AppointmentCreatedMessage.cs
│   └── MedicalRecordCreatedMessage.cs
└── Program.cs
```

**Key Responsibilities:**
- Consuming domain events from RabbitMQ
- Sending email notifications
- Fetching user data for email personalization
- Graceful error handling

### Naming Conventions

- **Controllers:** `[Entity]Controller.cs` (e.g., `AppointmentsController.cs`)
- **Services:** `[Entity]Service.cs` with interface `I[Entity]Service.cs`
- **Repositories:** `[Entity]Repository.cs` with interface `I[Entity]Repository.cs`
- **DTOs:** `[Entity]DTO.cs`, `[Entity]CreateDTO.cs`, `[Entity]UpdateDTO.cs`
- **Entities:** `[Entity].cs` (domain models)
- **Validators:** `[Entity]Validator.cs`
- **Mappings:** `[Service]Profile.cs` (AutoMapper profiles)

---

## Usage

### API Endpoints Overview

All requests go through the API Gateway at `http://localhost:8080`.

#### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_Name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone_Number": "+1234567890"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

#### Appointment Endpoints

**Create Appointment** (Anonymous or Authenticated)
```http
POST /api/appointment
Authorization: Bearer {token}  # Optional for anonymous bookings
Content-Type: application/json

{
  "doctorId": "123e4567-e89b-12d3-a456-426614174000",
  "appointmentTime": "2024-12-25T10:00:00Z",
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "notes": "Follow-up appointment"
}
```

**Get My Appointments**
```http
GET /api/appointment/myappointments
Authorization: Bearer {token}
```

**Get Appointment by ID**
```http
GET /api/appointment/{id}
Authorization: Bearer {token}
```

**Cancel Appointment**
```http
PUT /api/appointment/{id}
Authorization: Bearer {token}
```

#### Medical Records Endpoints

**Upload Medical Record** (Doctor only)
```http
POST /api/record
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "patient_Id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Blood Test Results",
  "description": "Complete blood count results",
  "file": [binary file data]
}
```

**Get My Records**
```http
GET /api/record/myrecords
Authorization: Bearer {token}
```

**Get Record by ID** (with signed URL)
```http
GET /api/record/{id}
Authorization: Bearer {token}
```

#### User Management Endpoints

**Get User Profile**
```http
GET /api/account/profile
Authorization: Bearer {token}
```

**Update Profile**
```http
PUT /api/account/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_Name": "John Updated",
  "phone_Number": "+9876543210"
}
```

**Get Doctors by Specialization**
```http
GET /api/doctor/specialisation/{specialisation}
Authorization: Bearer {token}
```

**Get All Specializations**
```http
GET /api/doctor/specialisations
Authorization: Bearer {token}
```

### Authentication Flow

1. **Client registers or logs in:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. **Extract JWT token from response:**
   ```json
   {
     "success": true,
     "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "message": "Login successful"
   }
   ```

3. **Use token in subsequent requests:**
   ```bash
   curl -X GET http://localhost:8080/api/appointment/myappointments \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

### Example: Complete Appointment Booking Flow

```bash
# 1. Register as patient
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_Name": "Alice Patient",
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "phone_Number": "+1234567890"
  }'

# Response contains JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Get available doctors
curl -X GET "http://localhost:8080/api/doctor/specialisation/Cardiology" \
  -H "Authorization: Bearer $TOKEN"

# 3. Create appointment
curl -X POST http://localhost:8080/api/appointment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "doctor-uuid-here",
    "appointmentTime": "2024-12-25T14:00:00Z",
    "fullName": "Alice Patient",
    "email": "alice@example.com",
    "notes": "Annual checkup"
  }'

# 4. Check my appointments
curl -X GET http://localhost:8080/api/appointment/myappointments \
  -H "Authorization: Bearer $TOKEN"
```

### Service Health Checks

```bash
# API Gateway
curl http://localhost:8080

# UserService
curl http://localhost:8081

# AppointmentService
curl http://localhost:8082

# MedicalRecordsService
curl http://localhost:8083

# NotificationService
curl http://localhost:8084/health
```

### Error Responses

All services return standardized error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Validation error or business rule violation
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### OpenAPI Documentation

In development mode, OpenAPI documentation is available:

- **ApiGateway:** http://localhost:8080/openapi/v1.json
- **UserService:** http://localhost:8081/openapi/v1.json
- **AppointmentService:** http://localhost:8082/openapi/v1.json
- **MedicalRecordsService:** http://localhost:8083/openapi/v1.json

---

## Additional Notes

### Development Best Practices

- **Environment Variables:** Use `.env` files or environment variables for sensitive configuration
- **Secrets Management:** Never commit GCP credentials or JWT secrets to version control
- **Database Migrations:** Always test migrations in development before production
- **Logging:** Use structured logging for better observability
- **Error Handling:** Implement comprehensive error handling and logging

### Future Enhancements

- **Service-to-Service Authentication:** Implement service tokens for internal communication
- **Event Sourcing:** Consider event sourcing for audit trails
- **CQRS:** Implement Command Query Responsibility Segregation for read/write optimization
- **API Versioning:** Add API versioning for backward compatibility
- **Rate Limiting:** Implement rate limiting at API Gateway
- **Monitoring:** Add distributed tracing (OpenTelemetry) and metrics (Prometheus)
- **Health Checks:** Implement comprehensive health check endpoints
- **Circuit Breaker:** Add circuit breaker pattern for resilience

---



