  // Initialize CKEditor
  CKEDITOR.replace('message');

  let emails = [];
  const emailInput = document.getElementById('emailInput');
  const emailList = document.getElementById('emailList');
  const emailError = document.getElementById('emailError');
  const form = document.getElementById('emailForm');
  const loading = document.getElementById('loading');
  const successAlert = document.getElementById('successAlert');
  const errorAlert = document.getElementById('errorAlert');
  const submitButton = document.getElementById('submitButton');

  // Show alert function
  function showAlert(message, type) {
      const alert = type === 'success' ? successAlert : errorAlert;
      alert.textContent = message;
      alert.style.display = 'block';
      setTimeout(() => {
          alert.style.display = 'none';
      }, 5000);
  }

  // Toggle loading state
  function toggleLoading(show) {
      loading.style.display = show ? 'block' : 'none';
      submitButton.disabled = show;
      emailInput.disabled = show;
      document.getElementById('subject').disabled = show;
      if (show) {
          submitButton.textContent = 'Sending...';
      } else {
          submitButton.textContent = 'Send Emails';
      }
  }

  // Email input handler
  emailInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
          e.preventDefault();
          const email = this.value.trim();
          if (validateEmail(email)) {
              if (!emails.includes(email)) {
                  addEmail(email);
                  this.value = '';
                  emailError.textContent = '';
              } else {
                  emailError.textContent = 'Email already added';
              }
          } else {
              emailError.textContent = 'Please enter a valid email address';
          }
      }
  });

  // Add email to the list
  function addEmail(email) {
      emails.push(email);
      renderEmails();
  }

  // Remove email from the list
  function removeEmail(email) {
      emails = emails.filter(e => e !== email);
      renderEmails();
  }

  // Render email list
  function renderEmails() {
      emailList.innerHTML = '';
      emails.forEach(email => {
          const li = document.createElement('li');
          li.className = 'email-item';
          li.innerHTML = `
              <span>${email}</span>
              <button type="button" class="remove-email" onclick="removeEmail('${email}')">Remove</button>
          `;
          emailList.appendChild(li);
      });
  }

  // Email validation
  function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  }

  // Form submission handler
  form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Reset alerts
      successAlert.style.display = 'none';
      errorAlert.style.display = 'none';

      let isValid = true;
      
      // Validate emails
      if (emails.length === 0) {
          emailError.textContent = 'Please add at least one email address';
          isValid = false;
      }

      // Validate subject
      const subject = document.getElementById('subject').value;
      if (!subject.trim()) {
          document.getElementById('subjectError').textContent = 'Subject is required';
          isValid = false;
      }

      // Get CKEditor content
      const message = CKEDITOR.instances.message.getData();
      if (!message.trim()) {
          document.getElementById('messageError').textContent = 'Message is required';
          isValid = false;
      }

      if (isValid) {
          try {
              toggleLoading(true);

              const response = await fetch('/send-mails', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      email: emails,
                      subject: subject,
                      message: message
                  })
              });

              const data = await response.json();

              if (data.success) {
                  showAlert('Emails sent successfully!', 'success');
                  // Reset form
                  form.reset();
                  emails = [];
                  renderEmails();
                  CKEDITOR.instances.message.setData('');
              } else {
                  throw new Error(data.error || 'Failed to send emails');
              }
          } catch (error) {
              showAlert(error.message || 'Error sending emails. Please try again.', 'error');
          } finally {
              toggleLoading(false);
          }
      }
  });

  function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

