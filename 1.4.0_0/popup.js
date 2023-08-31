document.addEventListener('DOMContentLoaded', () => {
  const apiKeyForm = document.getElementById('apiKeyForm');
  const apiKeyInput = document.getElementById('apiKey');
  const licenseKeyInput = document.getElementById('licenseKey');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const buyButton = document.getElementById('buyButton');
  const headerai = document.getElementById('headerai')
  const manageSubscriptionsButton = document.getElementById('manageSubscriptionsButton')
  buyButton.addEventListener('click', () => {
    window.open('https://cheatoz.gumroad.com/l/buy', '_blank');
  });
  manageSubscriptionsButton.addEventListener('click', () => {
    const url = `https://customers.gumroad.com/issues-with-your-purchase/how-do-i-cancel-my-membership`;
    window.open(url, '_blank');
  });
  // Function to check API key validity
  async function checkApiKey(apiKey) {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    return response.status === 200;
  }

  // Function to check license key validity
  async function checkLicenseKey(licenseKey) {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: 'LKbCF0wWsgjlsQHWsl9NkQ==',
        license_key: licenseKey
      })
    });

    const data = await response.json();
    return data.success;
  }

  // Function to update the visibility of elements based on verification status
  function updateVisibility(isVerified) {
    if (isVerified) {
      successMessage.textContent = 'Verified ✔️';
      successMessage.style.display = 'block';
      apiKeyInput.style.display = 'none';
      licenseKeyInput.style.display = 'none';
      apiKeyForm.style.display = 'none';
      buyButton.style.display = 'none';
      errorMessage.style.display = 'none';
      editKeysButton.style.display = 'block';
      manageSubscriptionsButton.style.display = 'block';
      headerai.style.display = 'none';
    } else {
      apiKeyInput.style.display = 'block';
      licenseKeyInput.style.display = 'block';
      apiKeyForm.style.display = 'block';
      buyButton.style.display = 'block';
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';
      editKeysButton.style.display = 'none';
      manageSubscriptionsButton.style.display = 'none';
      headerai.style.display = 'block';
    }
  }

  const editKeysButton = document.getElementById('editKeysButton');
  editKeysButton.addEventListener('click', () => {
    updateVisibility(false);
  });

  // Save the API key and license key to chrome.storage when the input values change
  apiKeyInput.addEventListener('input', (e) => {
    const apiKey = e.target.value;
    chrome.storage.sync.set({ apiKey: apiKey });
  });

  licenseKeyInput.addEventListener('input', (e) => {
    const licenseKey = e.target.value;
    chrome.storage.sync.set({ licenseKey: licenseKey });
  });

  // Load the API key and license key from chrome.storage and set them as the input values
  chrome.storage.sync.get(['apiKey', 'licenseKey'], async (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }

    if (data.licenseKey) {
      licenseKeyInput.value = data.licenseKey;
    }

    const isApiKeyValid = data.apiKey ? await checkApiKey(data.apiKey) : false;
    const isLicenseValid = data.licenseKey ? await checkLicenseKey(data.licenseKey) : false;
    const isVerified = isApiKeyValid && isLicenseValid;
    updateVisibility(isVerified);

    if (!isVerified) {
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'Invalid API key and license key. Please enter valid keys.';
    }
  });

  // Submit the form
  apiKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiKey = apiKeyInput.value;
    const licenseKey = licenseKeyInput.value;

    // Perform API key verification
    const isApiKeyValid = await checkApiKey(apiKey);

    if (!isApiKeyValid) {
      errorMessage.textContent = 'Invalid API key. Please enter a valid API key.';
      errorMessage.style.display = 'block';
      return;
    }

    // Perform license key verification
    const isLicenseValid = await checkLicenseKey(licenseKey);

    if (isLicenseValid) {
      chrome.storage.sync.set({ apiKey: apiKey, licenseKey: licenseKey }, () => {
        if (chrome.runtime.lastError) {
          errorMessage.textContent = 'Failed to save API key and license key. Error message: ' + chrome.runtime.lastError.message;
          errorMessage.style.display = 'block';
        } else {
          updateVisibility(true);
          alert('API key and license key saved successfully.');
        }
      });
    } else {
      if (!isApiKeyValid) {
        errorMessage.textContent = 'Invalid API key and license key. Please enter valid keys.';
      } else {
        errorMessage.textContent = 'Invalid license key. Please enter a valid license key.';
      }
      errorMessage.style.display = 'block';
    }
  });
});
