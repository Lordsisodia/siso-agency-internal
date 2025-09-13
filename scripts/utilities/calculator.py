"""
Simple calculator with add, subtract, multiply, and divide.

Run directly to see sample calculations.
"""

from typing import Union

Number = Union[int, float]


def add(a: Number, b: Number) -> Number:
    return a + b


def subtract(a: Number, b: Number) -> Number:
    return a - b


def multiply(a: Number, b: Number) -> Number:
    return a * b


def divide(a: Number, b: Number) -> Number:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


def _fmt(n: Number) -> str:
    """Format numbers nicely: avoid trailing .0 for whole floats."""
    try:
        return f"{n:g}"  # type: ignore[call-arg]
    except Exception:
        return str(n)


if __name__ == "__main__":
    # Test calculations
    results = [
        ("15 + 7", add(15, 7)),
        ("20 - 3", subtract(20, 3)),
        ("8 * 4", multiply(8, 4)),
        ("16 / 2", divide(16, 2)),
    ]

    for expr, value in results:
        print(f"{expr} = {_fmt(value)}")

