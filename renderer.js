document.addEventListener('DOMContentLoaded', () => {
    const requestDeviceButton = document.getElementById('request-device');

    requestDeviceButton.addEventListener('click', async () => {
        try {
            const devices = await window.WebHID.getDevices();
            console.log(devices);

            // Example: Request a device
            const device = await window.WebHID.requestDevice();
            console.log('Device requested:', device);

            if (device) {
                await device.open();
                console.log('Device opened:', device);
                // Add your further handling here
            }
        } catch (error) {
            console.error('Error requesting device:', error);
        }
    });
});