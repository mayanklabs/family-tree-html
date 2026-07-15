# Family Tree Editor

A simple browser-based Family Tree Editor built using the **family-chart** library. It allows you to create, edit, save, and load family trees locally without requiring a backend or database.

## Features

- Interactive family tree visualization
- Add, edit, and delete family members
- Manage parent, child, and spouse relationships
- Load existing JSON files
- Save changes back to the same JSON file
- Save As support
- Export family tree as JSON
- Auto-save after edits (supported browsers)
- Responsive full-screen interface
- Local file storage (no server required)

## Requirements

- Google Chrome (recommended)
- Microsoft Edge
- Brave

> The File System Access API is required for direct file saving. Other browsers may only support exporting/downloading JSON files.

## Project Structure

```
project/
│
├── index.html
├── family.json
└── README.md
```

## Running the Project

Since this project uses JavaScript modules, serve it using a local web server.

### VS Code Live Server

1. Install the **Live Server** extension.
2. Open the project folder.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

Or use Python:

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## Usage

### Create a New Family

Click **New** to start with an empty family tree.

### Open a Family

Click **Open JSON** and select an existing `family.json` file.

### Save

Click **Save** to write changes back to the opened file.

### Save As

Click **Save As** to save the family tree to a new JSON file.

### Export

Click **Export JSON** to download the current tree.

## JSON Format

Each person is represented as:

```json
{
    "id": "1",
    "data": {
        "first name": "John",
        "last name": "Doe",
        "gender": "M"
    },
    "rels": {
        "parents": [],
        "children": [],
        "spouses": []
    }
}
```

## Browser Compatibility

| Browser | Support |
|----------|---------|
| Chrome | ✅ |
| Edge | ✅ |
| Brave | ✅ |
| Firefox | Limited |
| Safari | Limited |

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES Modules)
- D3.js
- family-chart

## Notes

- Data is stored locally as JSON.
- No backend or database is required.
- The project runs completely offline after dependencies are loaded.
- Auto-save is available only in browsers supporting the File System Access API.

## License

This project is intended for personal and educational use.