import pandas as pd
import json
import dateutil.parser

data_path = "training_data_applications.json"

generic_email_domains = [
    "applytojob",
    "ashbyhq",
    "avature",
    "breezymail",
    "buyerlink",
    "freshteam",
    "gmail",
    "greenhouse",
    "greenhousemail",
    "jobvite",
    "harnham",
    "hirevue",
    "icims",
    "jobscore",
    "lever",
    "linkedin",
    "karat",
    "mindlance",
    "myworkday",
    "otta",
    "recruitee",
    "smartrecruiters",
    "wellfound",
]
# try:
#     app_df = pd.read_json(data_path, lines=True)
# except ValueError:
#     app_df = pd.read_json(data_path)
#     app_df = pd.read_json("backend/scripts/training_data.json")


with open(data_path, "r") as file:
    # Load the JSON data directly into a Python object
    data = json.load(file)


app_df = pd.DataFrame(data)
print(app_df.columns)
# Clean sender: remove quotes and extract first email inside <>
s = (
    app_df["sender"]
    .astype(str)
    .str.replace('"', "", regex=False)
    .str.replace("'", "", regex=False)
)
email_in_brackets = s.str.extract(
    r"<\s*([^<>@\s]+@[^<>@\s]+\.[^<>@\s]+)\s*>", expand=False
)
email_any = s.str.extract(
    r"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})", expand=False
)
app_df["sender"] = email_in_brackets.fillna(email_any)

print(app_df["date"].head)
"""
1            Wed, 21 May 2025 08:02:25 +0000
2      Sun, 11 May 2025 04:16:13 +0000 (UTC)
3             Fri, 9 May 2025 10:21:24 -0700
4      Fri, 09 May 2025 16:35:07 +0000 (UTC)
                       ...                  
782    Fri, 05 Jan 2024 20:02:40 +0000 (UTC)
783    Fri, 05 Jan 2024 05:35:07 +0000 (UTC)
784    Thu, 04 Jan 2024 20:07:27 +0000 (UTC)
785    Mon, 01 Jan 2024 22:24:07 +0000 (UTC)
786          Thu, 12 Jun 2025 17:24:50 -0700
"""
# Date filter (2025-01-01 to 2025-07-01 inclusive)
# app_df["date"] = pd.to_datetime(app_df["date"], errors="coerce")


def get_date_format(date_str):
    try:
        dt = dateutil.parser.parse(date_str, fuzzy=True)
        return dt
    except Exception:
        return "Unparseable"


app_df["date_formatted"] = app_df["date"].astype(str).apply(get_date_format)
print(app_df[["date", "date_formatted"]])
# app_df = app_df[(app_df["date"] >= "2025-01-01") & (app_df["date"] <= "2025-07-01")].copy()
# app_df = app_df[(app_df["id"] == "18fc53e1e5183432")] # TODO: REMOVE when done testing


def extract_before_dot(stringy):
    # @careers.stripe.com should return stripe
    # Split by dots and take the second-to-last part (before the TLD)
    parts = stringy.split(".")

    if len(parts) >= 2:
        # Remove common TLDs and get the main domain
        main_part = parts[-2]  # Second to last part (before .com, .org, etc.)
        return main_part
    else:
        return stringy


app_df["domain"] = (
    app_df["sender"]
    .str.extract(r"@([^>\s]+)", expand=False)
    .str.lower()
    .fillna("")
    .apply(extract_before_dot)
    .str.replace(r"[^\w]+", "", regex=True)
)

app_df["domain_copy"] = app_df["domain"]

company_name_in_subject_pattern = r'(?i)(?:@|your application was sent to|applying to|applied to|application to|for your interest in(?:\s+joining)?|at|hank you from|interview with|step with)\s+(?:.*?\s+\bat\b\s+)?["\'“”‘’<]*([\w][\w&.\'\s]*?)\s*(?:[^\w&.\'\s]|$)'
test = app_df["subject"].str.extract(company_name_in_subject_pattern, expand=False)
app_df["sent_to_word"] = test
mask = app_df["subject"].str.contains(
    company_name_in_subject_pattern, regex=True, na=False
)
# import pdb; pdb.set_trace()
app_df.loc[mask, "domain_copy"] = app_df.loc[mask, "sent_to_word"].apply(
    lambda s: s.lower().strip() if pd.notnull(s) else s
)


print(app_df)
# Sort by domain and date ASC
app_df = app_df.sort_values(["domain", "date_formatted"], ascending=[True, True])
app_df["domain_copy"] = app_df["domain_copy"].mask(
    app_df["domain"].isin(generic_email_domains)
)
# import pdb; pdb.set_trace()
app_df["split_sent_word"] = app_df["sent_to_word"].apply(
    lambda s: str(s).split(" at ")[-1].strip()
)  # the Frontend Engineer role at GitLab -> GitLab
app_df["split_sent_word_with"] = app_df["subject"].apply(
    lambda s: str(s).split(" with ")[0].strip()
)  # the Frontend Engineer role with GitLab -> GitLab
# import pdb; pdb.set_trace()
app_df["split_sent_word_at_symbol"] = app_df["subject"].apply(
    lambda s: str(s).split(" @ ")[-1].strip()
)  # the Frontend Engineer role @ GitLab -> GitLab
app_df["first_before_dash"] = app_df["sent_to_word"].apply(
    lambda s: str(s).split("-")[0].strip()
)  # Canonical - Python Software Engineer - Ubuntu Server Certification -> Canonical
app_df["before_for"] = app_df["sent_to_word"].apply(
    lambda s: str(s).split(" for")[0].strip()
)  # Allergan Data Labs for the Sr. Data Engineer -> Allergan Data Labs
app_df["first_before_dash_subject"] = app_df["subject"].apply(
    lambda s: (str(s).split("-")[0].strip() if ("-" in str(s)) else pd.NA)
)  # Canonical - Python Software Engineer - Ubuntu Server Certification -> Canonical

# getting before preposition now
before_prep_in_subject_pattern = (
    r"([A-Z]\w*(?:\s+[A-Z]\w*)*)\s+\b(?:successfully|has|was|in|of)\b"
)
test_prep = app_df["first_before_dash"].str.extract(
    before_prep_in_subject_pattern, expand=False
)
app_df["before_prep"] = test_prep
mask = app_df["first_before_dash"].str.contains(
    before_prep_in_subject_pattern, regex=True, na=False
)
# import pdb; pdb.set_trace()
app_df.loc[mask, "before_prep_copy"] = app_df.loc[mask, "before_prep"].apply(
    lambda s: s.strip() if pd.notnull(s) else s
)


interview_pattern = r"(?i)^(?:Re:\s*)?(.*?)(?=\s*(?:(?:Zoom|Phone|Virtual|Video|Technical)\s+)?(?:Interview|application)|\|)"
test_interview = app_df["subject"].str.extract(interview_pattern, expand=False)
app_df["before_interview"] = test_interview
mask = app_df["subject"].str.contains(interview_pattern, regex=True, na=False)
# import pdb; pdb.set_trace()
app_df.loc[mask, "before_itnerview_copy"] = app_df.loc[mask, "before_interview"].apply(
    lambda s: (s.strip() if ":" not in s else s.split(":")[0].strip())
    if pd.notnull(s)
    else s
)
# app_df['coalesce'] = app_df[['domain', 'domain_copy']].bfill(axis=1).iloc[:, 0]
# app_df["coalesce2"] = app_df["coalesce"].mask(app_df["coalesce"].isin(generic_email_domains))
# app_df["sent_to_word2"] = app_df["sent_to_word"].str.contains(company_name_in_subject_pattern, regex=True, na=False)
# app_df.loc[mask, "sent_to_word3"] = app_df.loc[mask, "sent_to_word2"].apply(lambda s: s.lower().strip() if pd.notnull(s) and type(s) != bool else s)


app_df.to_csv("applications.csv", index=False)


# Per-domain summary: first, next, next-next status (only if first == "Application confirmation")
def _summarize(g: pd.DataFrame) -> pd.Series:
    g = g.sort_values("date_formatted", ascending=True)
    statuses = g["application_status"].tolist()
    first = statuses[0] if len(statuses) else None
    next1 = (
        statuses[1]
        if len(statuses) > 1 and first == "Application confirmation"
        else None
    )
    next2 = (
        statuses[2]
        if len(statuses) > 2 and first == "Application confirmation"
        else None
    )
    last = statuses[-1] if len(statuses) else None
    return pd.Series(
        {
            "Initial Status": first,
            "Next Status": next1,
            "Next Next Status": next2,
            "Final Status": last,
        }
    )


# domain_summary = app_df.groupby("domain").apply(_summarize).reset_index()

# domain_summary.to_csv("domain_summary.csv", index=False)
