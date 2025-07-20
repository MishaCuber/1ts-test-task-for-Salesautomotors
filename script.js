document.getElementById('workiz-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const title = `${data.first_name} ${data.last_name} (${data.job_type})`;
  const note = `Phone: ${data.phone}\nEmail: ${data.email}\n\nJob source: ${data.job_source}\nJob description: ${data.job_description}\n\nService location: ${data.address}, ${data.city}, ${data.state}, ${data.zip_code}, ${data.area}\n\nScheduled: ${data.start_date} ${data.start_time}-${data.end_time}\nTest select: ${data.test_select}`;

  const apiToken = '280373afaf78ec3c8b8592d493e5016fb18019b9';
  const personUrl = `https://api.pipedrive.com/v1/persons?api_token=${apiToken}`;
  const dealUrl = `https://api.pipedrive.com/v1/deals?api_token=${apiToken}`;

  const messageDiv = document.getElementById('form-message');
  messageDiv.textContent = 'Sending...';
  messageDiv.style.color = '#333';

  let personId = null;

  // person
  try {
    const personBody = {
      name: `${data.first_name} ${data.last_name}`,
      phone: data.phone,
      email: data.email
    };
    const personResp = await fetch(personUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personBody)
    });
    const personResult = await personResp.json();
    if (personResult.success && personResult.data && personResult.data.id) {
      personId = personResult.data.id;
    }
  } catch (err) {
    // Если не удалось создать контакт, продолжаем без него
    personId = null;
  }

  // сделка
  try {
    const dealBody = {
      title
    };
    if (personId) {
      dealBody.person_id = personId;
    }
    const dealResp = await fetch(dealUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealBody)
    });
    const dealResult = await dealResp.json();
    if (dealResult.success) {
      // заметка
      const dealId = dealResult.data.id;
      const noteUrl = `https://api.pipedrive.com/v1/notes?api_token=${apiToken}`;
      const noteBody = {
        content: note,
        deal_id: dealId
      };
      try {
        await fetch(noteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteBody)
        });
      } catch (noteErr) {
        // на всякий случай
      }
      messageDiv.textContent = 'Form submitted successfully! Deal created in Pipedrive.';
      messageDiv.style.color = '#2e7d32';
      form.reset();
    } else {
      messageDiv.textContent = 'Error: ' + (dealResult.error || 'Could not create deal.');
      messageDiv.style.color = '#c62828';
    }
  } catch (err) {
    messageDiv.textContent = 'Network error. Please try again.';
    messageDiv.style.color = '#c62828';
  }
}); 