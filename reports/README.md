# Case Report Management System

This directory contains the case report management system for the Juvo AI analysis platform.

## Directory Structure

```
reports/
├── case-reports/          # Directory for uploaded report files
├── metadata/              # System metadata and configuration
│   └── report-structure.json  # Report data structure documentation
└── README.md             # This file
```

## Features

### Status Management
- **New**: Initial status for all cases
- **Investigation**: Case is being actively investigated
- **Intervention**: Active intervention measures are being taken
- **Resolution**: Case has been resolved

### Report Requirements
When changing a case status, users must provide:
- **Text Report**: Description of actions taken, findings, or reasoning for status change
- **File Upload** (optional): Supporting documentation (PDF, DOC, DOCX, TXT)

### Data Storage
Currently uses localStorage for development/demo purposes:
- `caseStatuses`: Current status for each analysis ID
- `caseReports`: Array of reports for each analysis ID

## Usage

### Changing Case Status
1. Click the status dropdown for any case in the analysis table
2. Select new status from dropdown
3. Fill out required report in the modal that opens
4. Optionally upload a supporting file
5. Click "Save Status Change"

### Viewing Reports
1. Click the file icon in the "Reports" column
2. View report count and click to see all reports for that case
3. Reports show timestamp, status changes, and report text

### Exporting Data
The CSV export includes:
- Current status for each case
- Number of reports filed for each case

## Technical Implementation

### Component Integration
- **AnalysisTable.jsx**: Main table with status dropdown and report viewing
- **AnalysisSection.jsx**: Export functionality includes status data

### State Management
- Status changes trigger required report modal
- Data persisted to localStorage for demo purposes
- Real implementation should use backend API

### File Handling
- Files are selected via file input
- File names stored in report metadata
- Actual file storage requires backend implementation

## Future Enhancements

1. **Backend Integration**: Replace localStorage with proper API
2. **File Storage**: Implement actual file upload and storage
3. **Report Templates**: Pre-defined report templates for different status changes
4. **Notifications**: Email/system notifications for status changes
5. **Audit Trail**: Complete audit log of all case activities
6. **Role-based Access**: Different permissions for different user roles