from utils.job_utils import get_side_with_job_role, remove_text_after_first_dash, remove_seniority_levels, remove_numbers_and_ids, normalize_job_title, is_job_role_word, ends_with_job_role

def test_normalize_job_title():
    assert normalize_job_title("Delivery Consultant") == "Delivery Consultant"
    assert normalize_job_title("Data Engineer") == "Data Engineer"
    assert normalize_job_title("Full-Stack Developer (Django & React)") == "Fullstack Developer"
    assert normalize_job_title("ML Engineer (Algorithm Developer)") == "ML Engineer"
    assert normalize_job_title("AI/ML Engineer") == "Aiml Engineer"
    assert normalize_job_title("Python Architect") == "Python Architect"
    assert normalize_job_title("AI-native platform") == "Unknown"

def test_is_job_role_word():
    assert is_job_role_word("Engineer")
    assert is_job_role_word("Manager")

def test_ends_with_job_role():
    assert ends_with_job_role("Software engineer") == "engineer"
    assert ends_with_job_role("Software Engineer") == "Engineer"
    assert not ends_with_job_role("Software")
    assert ends_with_job_role("AI/ ML Engineer") == "Engineer"

def test_remove_numbers_and_ids():
    assert remove_numbers_and_ids("Software Engineer 2") == "Software Engineer"
    assert remove_numbers_and_ids("AI/ML Engineer") == "AI/ML Engineer"

def test_remove_seniority_levels():
    assert remove_seniority_levels("Senior Software Engineer") == "Software Engineer"
    assert remove_seniority_levels("CEO") == "CEO"
    assert remove_seniority_levels("Chief Finance Officer") == "Chief Finance Officer"
    assert remove_seniority_levels("Junior Project Manager") == "Project Manager"
    assert remove_seniority_levels("New Grad Software Engineering Intern") == "Software Engineering Intern"
    assert remove_seniority_levels("Software Lead") == "Software Lead"

def test_remove_text_after_first_dash_unless_no_spaces():
    assert remove_text_after_first_dash("Full-Stack Dev") == "Full-Stack Dev"
    assert remove_text_after_first_dash("R933420 -Engineer") == ['R933420', 'Engineer']
    assert remove_text_after_first_dash("R933420- Engineer") == ['R933420', 'Engineer']

def test_get_side_with_job_role():
    assert get_side_with_job_role("R93- Engineer") == "Engineer"
    assert get_side_with_job_role("R93- Unknown") == "Unknown"
    assert get_side_with_job_role("Engineer - Unknown") == "Engineer"
    assert get_side_with_job_role("Engineer- Manager") == "Engineer"
    assert get_side_with_job_role("Engineer-Manager") == "Engineer-Manager"
    assert get_side_with_job_role("AI/ML Engineer", "slash") == "AI/ML Engineer"
    assert get_side_with_job_role("AI/ ML Engineer", "slash") == "ML Engineer"
