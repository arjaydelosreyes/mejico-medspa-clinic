import emailjs from '@emailjs/browser';

export const sendEmail = async ({ to, subject, body, verificationCode }) => {
  try {
    // Create template parameters
    const templateParams = {
      // Include the recipient email in both the template parameters AND the options
      to_email: to,
      to_name: to.split('@')[0],
      from_name: 'Mejico MD Medical Spa',
      verification_code: verificationCode,
      message: body,
      subject: subject
    };

    // Send email with recipient specified in both template and options
    const response = await emailjs.send(
      'service_tsc05jy',
      'template_aasdwau',
      {
        ...templateParams,
        // Ensure the recipient is set in the core options
        to: to,
        from_email: 'noreply@mejicomdmedicalspa.com'
      },
      'wOA-rb4GlzrB2-5VT'
    );

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// In your Vue component's handleEmailUpdate function:
const handleEmailUpdate = async () => {
  if (newEmail.value !== confirmEmail.value) {
    emailError.value = true;
    setTimeout(() => {
      emailError.value = false;
    }, 500);
    return;
  }

  try {
    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Send verification email to the NEW email address
    await sendEmail({
      to: newEmail.value, // Use the new email address from the form
      subject: 'Email Change Verification',
      body: `Your verification code is: ${verificationCode}. This code will expire in 1 hour.`,
      verificationCode: verificationCode
    });

    // Store pending email change in Firestore
    await updateDoc(doc(database, 'users', auth.currentUser.uid), {
      pendingEmail: newEmail.value,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + 3600000)
    });

    showEmailForm.value = false;
    showVerificationForm.value = true;
    alert('A verification code has been sent to your new email address. Please check your inbox and enter the code to complete the process.');
  } catch (error) {
    alert('Error initiating email change: ' + error.message);
    console.error('Email change error:', error);
  }
};