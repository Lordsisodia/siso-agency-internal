import re
from typing import Union


def validate_email(email: str) -> dict:
    """
    Validate an email address.

    Args:
        email: The email address to validate

    Returns:
        dict with 'valid' (bool) and 'message' (str) keys
    """
    if not email or not isinstance(email, str):
        return {'valid': False, 'message': 'Email must be a non-empty string'}

    # Basic regex pattern for email validation
    # This follows RFC 5322 simplified rules
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(pattern, email):
        return {'valid': False, 'message': 'Invalid email format'}

    # Check for common issues
    if '..' in email:
        return {'valid': False, 'message': 'Email cannot contain consecutive dots'}

    if email.startswith('.') or email.endswith('.'):
        return {'valid': False, 'message': 'Email cannot start or end with a dot'}

    if '@.' in email or '.@' in email:
        return {'valid': False, 'message': 'Invalid placement of @ symbol'}

    # Check domain has at least one dot
    parts = email.split('@')
    if len(parts) != 2:
        return {'valid': False, 'message': 'Email must contain exactly one @ symbol'}

    domain = parts[1]
    if '.' not in domain:
        return {'valid': False, 'message': 'Domain must contain at least one dot'}

    # Check TLD is at least 2 characters
    tld = domain.split('.')[-1]
    if len(tld) < 2:
        return {'valid': False, 'message': 'Top-level domain must be at least 2 characters'}

    return {'valid': True, 'message': 'Valid email address'}


def validate_email_simple(email: str) -> bool:
    """
    Simple email validation - returns True/False only.

    Args:
        email: The email address to validate

    Returns:
        bool: True if valid, False otherwise
    """
    result = validate_email(email)
    return result['valid']


if __name__ == '__main__':
    # Test cases
    test_emails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'invalid',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example',
        'test@test@test.com',
    ]

    for email in test_emails:
        result = validate_email(email)
        print(f"{email:30} -> {result['valid']:5} ({result['message']})")
