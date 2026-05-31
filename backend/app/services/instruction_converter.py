import re
from typing import Optional


ACTION_MAP = {
    "increase": "increase",
    "decrease": "decrease",
    "add": "add",
    "remove": "remove",
    "change": "change",
    "update": "update",
    "improve": "improve",
    "adjust": "adjust",
    "move": "move",
    "resize": "resize",
    "merge": "merge",
    "split": "split",
    "reorder": "reorder",
    "replace": "replace",
    "rename": "rename",
    "align": "align",
    "fix": "fix",
}

TARGET_PATTERNS = [
    r"stage\s*(\d+)",
    r"module\s*(\w+)",
    r"component\s*(\w+)",
    r"block\s*(\w+)",
    r"node\s*(\w+)",
    r"layer\s*(\d+)",
    r"section\s*(\d+)",
    r"box\s*(\w+)",
    r"arrow",
    r"label",
    r"title",
    r"legend",
    r"border",
    r"background",
    r"font",
    r"spacing",
    r"padding",
    r"color",
    r"layout",
]

INSTRUCTION_TYPE_MAP = {
    "spacing": "layout",
    "padding": "layout",
    "alignment": "layout",
    "align": "layout",
    "layout": "layout",
    "color": "color",
    "background": "color",
    "shade": "color",
    "font": "style",
    "bold": "style",
    "italic": "style",
    "border": "style",
    "label": "label",
    "title": "label",
    "caption": "label",
    "legend": "label",
    "annotation": "label",
    "arrow": "component",
    "stage": "component",
    "module": "component",
    "block": "component",
    "layer": "component",
}


class InstructionConverter:
    def convert_message_to_instruction(self, content: str, message_id: str, project_id: str, room_id: str) -> Optional[dict]:
        text = content.lower()
        action = None
        for verb, mapped_action in ACTION_MAP.items():
            if verb in text:
                action = mapped_action
                break

        target = None
        for pattern in TARGET_PATTERNS:
            match = re.search(pattern, text)
            if match:
                target = match.group(0).replace(" ", "_")
                break

        instruction_type = "general"
        for keyword, itype in INSTRUCTION_TYPE_MAP.items():
            if keyword in text:
                instruction_type = itype
                break

        payload = {}
        number_matches = re.findall(r"\b(\d+(?:\.\d+)?)\s*(px|pt|em|rem|%)?", text)
        if number_matches:
            payload["values"] = [{"number": m[0], "unit": m[1] or "px"} for m in number_matches[:3]]

        color_matches = re.findall(r"#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)", content)
        if color_matches:
            payload["colors"] = color_matches

        if not action and not target:
            return None

        return {
            "project_id": project_id,
            "room_id": room_id,
            "instruction_type": instruction_type,
            "target": target or "general",
            "action": action or "update",
            "payload": payload,
            "source_message_ids": [message_id],
        }


instruction_converter = InstructionConverter()
