/**
 * Vastraa Premium Indian Ethnic Wear — Form Handling & Validation Engine
 * Universal form validation, ARIA live alerts, error states, and submission handling
 */

export const VALIDATION_RULES = {
  required: (val) => Boolean(val && val.toString().trim().length > 0),
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim()),
  phone: (val) => /^(\+91[\s\-]?)?[6789]\d{9}$/.test(String(val).replace(/[\s\-]/g, "")),
  pinCode: (val) => /^[1-9][0-9]{5}$/.test(String(val).trim()),
  minLength: (min) => (val) => Boolean(val && val.toString().trim().length >= min)
};

/**
 * Validate an individual input element against field constraints
 */
export function validateField(inputElement, rules = {}) {
  if (!inputElement) return true;

  const value = inputElement.value ? inputElement.value.trim() : "";
  const name = inputElement.name || inputElement.id || "Field";
  let errorMessage = "";

  if (rules.required && !VALIDATION_RULES.required(value)) {
    errorMessage = `${rules.label || name} is required.`;
  } else if (value && rules.email && !VALIDATION_RULES.email(value)) {
    errorMessage = "Please enter a valid email address.";
  } else if (value && rules.phone && !VALIDATION_RULES.phone(value)) {
    errorMessage = "Please enter a valid 10-digit Indian phone number.";
  } else if (value && rules.pinCode && !VALIDATION_RULES.pinCode(value)) {
    errorMessage = "Please enter a valid 6-digit Indian PIN code.";
  } else if (value && rules.minLength && !VALIDATION_RULES.minLength(rules.minLength)(value)) {
    errorMessage = `${rules.label || name} must be at least ${rules.minLength} characters.`;
  }

  const errorContainerId = `${inputElement.id || inputElement.name}-error`;
  let errorElement = document.getElementById(errorContainerId);

  if (errorMessage) {
    inputElement.setAttribute("aria-invalid", "true");
    inputElement.classList.add("is-invalid");

    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.id = errorContainerId;
      errorElement.className = "form-error-msg";
      errorElement.setAttribute("role", "alert");
      errorElement.style.cssText = "display: block; color: #C62828; font-size: 0.775rem; margin-top: 4px; font-weight: 500;";
      inputElement.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = errorMessage;
    inputElement.setAttribute("aria-describedby", errorContainerId);
    return false;
  } else {
    inputElement.removeAttribute("aria-invalid");
    inputElement.classList.remove("is-invalid");
    if (errorElement) {
      errorElement.textContent = "";
    }
    return true;
  }
}

/**
 * Validate an entire form element according to a schema map
 */
export function validateForm(formElement, schema = {}) {
  if (!formElement) return false;
  let isValid = true;
  let firstInvalidField = null;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const input = formElement.elements[fieldName] || formElement.querySelector(`[name="${fieldName}"], #${fieldName}`);
    if (input) {
      const fieldValid = validateField(input, rules);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidField) firstInvalidField = input;
      }
    }
  }

  if (firstInvalidField) {
    firstInvalidField.focus();
  }

  return isValid;
}

/**
 * Automatically bind accessible live validation to forms across the site
 */
export function initFormValidation() {
  // 1. Newsletter subscription forms
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && !validateField(emailInput, { required: true, email: true, label: "Email" })) {
        e.preventDefault();
      }
    });
  });

  // 2. Contact & concierge forms
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      const schema = {
        fullName: { required: true, minLength: 2, label: "Full Name" },
        email: { required: true, email: true, label: "Email Address" },
        phone: { required: false, phone: true, label: "Phone Number" },
        message: { required: true, minLength: 10, label: "Message / Inquiry" }
      };
      if (!validateForm(contactForm, schema)) {
        e.preventDefault();
      }
    });
  }
}

// Global browser attachment for non-module compatibility
if (typeof window !== "undefined") {
  window.VastraaValidation = {
    VALIDATION_RULES,
    validateField,
    validateForm,
    initFormValidation
  };
}
