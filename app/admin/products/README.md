# Product Playground Admin

This directory contains the admin interface for the Product Playground system in the Blackbird Portal.

## Features

- **Product Management**: Create, edit, and manage products
- **Purchase Management**: Review and process purchase requests
- **Category Filtering**: Filter products by category
- **Search Functionality**: Search products by name or description
- **Status Tracking**: Track purchase status with visual indicators

## Pages

1. **Products Page** (`/admin/products`): Manage all products
2. **Purchases Page** (`/admin/purchases`): Review and process purchase requests

## Components

### Products
- `ProductsHeader`: Header with title and add product button
- `ProductsStats`: Statistics cards showing product metrics
- `ProductsFilters`: Search and category filtering
- `ProductsList`: List of products with details
- `ProductDialog`: Dialog for creating/editing products

### Purchases
- `PurchasesHeader`: Header with title
- `PurchasesStats`: Statistics cards showing purchase metrics
- `PurchasesFilters`: Search, status, and buyer type filtering
- `PurchasesList`: List of purchases with details
- `PurchaseDialog`: Dialog for viewing and updating purchase status

## Data Structure

The data structures are defined in `types.ts` and mock data is provided in `mock-data.ts`.

## Usage

1. Navigate to `/admin/products` to manage products
2. Navigate to `/admin/purchases` to manage purchase requests

## Implementation Notes

- This is a client-side implementation with mock data
- In a production environment, the data would be fetched from the API endpoints
- The UI follows the design system of the Blackbird Portal 