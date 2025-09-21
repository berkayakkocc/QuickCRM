# Backend Dockerfile for Railway
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["QuickCRM.API/QuickCRM.API.csproj", "QuickCRM.API/"]
COPY ["QuickCRM.Application/QuickCRM.Application.csproj", "QuickCRM.Application/"]
COPY ["QuickCRM.Core/QuickCRM.Core.csproj", "QuickCRM.Core/"]
COPY ["QuickCRM.Infrastructure/QuickCRM.Infrastructure.csproj", "QuickCRM.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "QuickCRM.API/QuickCRM.API.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/QuickCRM.API"
RUN dotnet build "QuickCRM.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QuickCRM.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables for Railway
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV PORT=80

ENTRYPOINT ["dotnet", "QuickCRM.API.dll"]
