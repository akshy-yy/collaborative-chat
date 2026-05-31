import re
# Note: ChangeCategory enum is kept for reference, but we return plain strings
# to match SQLite model field (change_category is stored as String)
from app.models.message import ChangeCategory


class ChangeClassifier:
    IMPROVEMENT_PATTERNS = [
        r"increase\s+spacing", r"add\s+label", r"improve\s+contrast", r"sharper", r"higher\s+resolution",
        r"increase\s+font", r"add\s+arrow", r"bold\s+text", r"clearer", r"enhance\s+visibility",
        r"better\s+alignment", r"add\s+legend", r"increase\s+padding", r"more\s+detail",
        r"larger\s+font", r"more\s+visible", r"brighter", r"improve\s+readability",
        r"increase\s+size", r"add\s+annotation", r"sharpen", r"highlight", r"emphasize",
        r"add\s+title", r"add\s+caption", r"add\s+border", r"thicker\s+border",
        r"better\s+spacing", r"increase\s+resolution", r"improve\s+quality",
    ]

    DEGRADING_PATTERNS = [
        r"reduce\s+resolution", r"remove\s+label", r"simplify\s+to\s+plain", r"remove\s+color",
        r"decrease\s+font", r"remove\s+arrow", r"remove\s+annotation", r"plain\s+block",
        r"lower\s+quality", r"remove\s+border", r"delete\s+label", r"less\s+detail",
        r"smaller\s+font", r"grayscale", r"remove\s+legend", r"remove\s+title",
        r"simplify\s+the", r"make\s+it\s+simpler", r"remove\s+all", r"strip\s+out",
        r"reduce\s+size", r"shrink\s+the", r"remove\s+caption",
    ]

    STRUCTURAL_PATTERNS = [
        r"reorder\s+all", r"change\s+layout", r"merge\s+stage", r"split\s+stage",
        r"remove\s+stage", r"add\s+stage", r"reorganize", r"restructure",
        r"new\s+layout", r"different\s+layout", r"change\s+structure",
        r"reorder\s+stages", r"swap\s+stage", r"move\s+stage",
    ]

    def classify(self, content: str) -> ChangeCategory:
        """Returns ChangeCategory enum — caller must use .value for DB storage."""
        text = content.lower()
        for pattern in self.STRUCTURAL_PATTERNS:
            if re.search(pattern, text):
                return ChangeCategory.structural_change
        for pattern in self.DEGRADING_PATTERNS:
            if re.search(pattern, text):
                return ChangeCategory.potentially_degrading
        for pattern in self.IMPROVEMENT_PATTERNS:
            if re.search(pattern, text):
                return ChangeCategory.improvement
        return ChangeCategory.neutral

    def is_high_priority_role(self, role: str) -> bool:
        return role in ("principal_investigator", "supervisor")


change_classifier = ChangeClassifier()
