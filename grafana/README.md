# Ajenti 2 Grafana Plugin

This plugin adds Grafana dashboard integration to Ajenti 2 web panel.

## Features
- Embeds Grafana dashboard directly in Ajenti interface
- Appears as "GRAFANA" section in the sidebar
- Configurable Grafana URL
- Responsive iframe integration

## Installation

### Method 1: Standard Ajenti Installation
1. Extract the `grafana` folder to your Ajenti plugins directory:
   - Default path: `/var/lib/ajenti/plugins/`
   - Custom installations: `<AJENTI_PATH>/var/lib/ajenti/plugins/`

2. Set proper permissions:
   ```bash
   chown -R root:root /var/lib/ajenti/plugins/grafana
   chmod -R 755 /var/lib/ajenti/plugins/grafana
   ```

3. Restart Ajenti:
   ```bash
   systemctl restart ajenti
   ```

### Method 2: For Relocatable Voice Platform Builds
1. Copy the `grafana` folder to your build system
2. In your build scripts, copy to: `${INSTALL_DIR}/var/lib/ajenti/plugins/grafana`
3. Ensure the service user has read permissions

## Configuration

Edit the `GRAFANA_URL` variable in `views.py`:

```python
# Configure your Grafana URL here
GRAFANA_URL = "http://192.168.33.10:3000"
```

### For Build Automation
You can use sed to replace the URL during package creation:

```bash
sed -i 's|http://192.168.33.10:3000|http://YOUR_GRAFANA_URL:3000|g' \
    ${INSTALL_DIR}/var/lib/ajenti/plugins/grafana/views.py
```

Or make it configurable in your master orchestrator:
```bash
read -p "Enter Grafana URL [http://localhost:3000]: " GRAFANA_URL
GRAFANA_URL=${GRAFANA_URL:-http://localhost:3000}

sed -i "s|GRAFANA_URL = \".*\"|GRAFANA_URL = \"${GRAFANA_URL}\"|g" \
    ${INSTALL_DIR}/var/lib/ajenti/plugins/grafana/views.py
```

## File Structure
```
grafana/
├── __init__.py                  # Plugin initialization (uses @component decorator)
├── plugin.yml                   # Plugin metadata with resources section
├── main.py                      # Main plugin class
├── views.py                     # API endpoints and routing (uses @component decorator)
├── resources/
│   ├── js/
│   │   └── controllers.es6.js  # AngularJS frontend controller
│   └── partial/
│       └── index.html           # HTML template
└── README.md                    # This file
```

## Python Decorator Notes

This plugin uses Ajenti 2's `@component` decorator from the `jadi` framework:
```python
from jadi import component
from aj.api.http import HttpPlugin

@component(HttpPlugin)
class YourClass(HttpPlugin):
    ...
```

## Customization

### Change Sidebar Position
Edit `weight` value in `controllers.es6.js`:
```javascript
weight: 45,  // Lower number = higher in sidebar
```

### Change Icon
Edit `icon` value in `controllers.es6.js`:
```javascript
icon: 'bar-chart',  // Any Font Awesome icon name
```

### Iframe Security
Modify the `sandbox` attribute in `index.html` if needed:
```html
sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
```

## Troubleshooting

### Plugin doesn't appear in sidebar
1. Check Ajenti logs: `journalctl -u ajenti -f`
2. Verify file permissions
3. Ensure all files are in correct locations
4. Try: `systemctl restart ajenti`

### Grafana not loading in iframe
1. Check Grafana URL is accessible from the server
2. Verify Grafana allows iframe embedding (check X-Frame-Options)
3. Check browser console for CORS or CSP errors
4. In Grafana, ensure `allow_embedding = true` in grafana.ini

### CORS Issues
If Grafana blocks iframe embedding, add to Grafana's `grafana.ini`:
```ini
[security]
allow_embedding = true
cookie_samesite = disabled
```

## Integration with Voice Platform Build System

Add to your `create_package.sh`:

```bash
# Copy Grafana plugin
echo "Installing Grafana plugin..."
cp -r grafana ${INSTALL_DIR}/var/lib/ajenti/plugins/

# Configure Grafana URL
if [ ! -z "$GRAFANA_URL" ]; then
    sed -i "s|GRAFANA_URL = \".*\"|GRAFANA_URL = \"${GRAFANA_URL}\"|g" \
        ${INSTALL_DIR}/var/lib/ajenti/plugins/grafana/views.py
fi

# Set permissions
chown -R ${SERVICE_USER}:${SERVICE_USER} ${INSTALL_DIR}/var/lib/ajenti/plugins/grafana
```

## Support

- Author: Comitfs Ltd
- Homepage: https://comitfs.com
- Plugin Version: 1.0

## License

Proprietary - Comitfs Ltd
