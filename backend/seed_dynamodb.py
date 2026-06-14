"""
ReLoop — AI-powered Returns & Resale (Amazon HackOn 6.0)
DynamoDB Seeder Script
Reads credentials from: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
"""

import boto3
import os
import random
from datetime import datetime, timedelta
from decimal import Decimal
from dotenv import load_dotenv

# Load backend/.env so AWS creds are available when running this script directly.
load_dotenv()

# ─── AWS Setup ───────────────────────────────────────────────────────────────

AWS_ACCESS_KEY_ID     = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_REGION            = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

# ─── Constants ────────────────────────────────────────────────────────────────

RETURN_REASONS = [
    "size runs small",
    "not as described",
    "changed my mind",
    "defective",
    "wrong item",
    "poor quality",
    "size runs large",
    "not compatible",
]

GRADES         = ["A", "B", "C", "R"]
GRADE_WEIGHTS  = [0.30, 0.40, 0.20, 0.10]
GREEN_CREDITS  = {"A": 50, "B": 35, "C": 20, "R": 10}

REDIRECT_PATHS = ["resell", "refurbish", "donate", "recycle", "exchange"]

PRODUCT_DATA = {
    "electronics": [
        ("boAt Rockerz 450 Bluetooth Headphones",      1499),
        ("Redmi Note 13 Pro 5G Smartphone",            24999),
        ("Samsung 43-inch Crystal UHD Smart TV",       32999),
        ("Sony WH-1000XM5 Noise Cancelling Headphones",29990),
        ("Fire TV Stick 4K with Alexa Remote",          5999),
        ("realme Buds Air 5 TWS Earbuds",              3499),
        ("Logitech MX Master 3S Wireless Mouse",        8495),
        ("Zebronics ZEB-Rush Gaming Keyboard",          1299),
        ("Xiaomi Smart Band 8 Pro Fitness Tracker",    5499),
        ("Anker 65W GaN Fast Charger",                 2499),
        ("JBL Charge 5 Portable Bluetooth Speaker",   14999),
        ("Canon EOS M50 Mark II Mirrorless Camera",   57990),
        ("WD 1TB My Passport Portable SSD",            7499),
        ("TP-Link Archer AX23 WiFi 6 Router",          5499),
        ("Portronics Toad 11 Wireless Mouse",           699),
    ],
    "clothing": [
        ("Levi's 511 Slim Fit Stretch Jeans",          2999),
        ("Allen Solly Men's Regular Polo T-Shirt",     1299),
        ("Fabindia Women's Kurta Set",                 2799),
        ("Puma Men's Running Shoes",                   3499),
        ("Arrow Men's Formal Shirt",                   1799),
        ("W Women's Printed Wrap Dress",               1999),
        ("Woodland Genuine Leather Casual Shoes",      4999),
        ("Biba Women's Ethnic Salwar Suit",            2499),
        ("HRX by Hrithik Roshan Men's Track Pants",   1199),
        ("AND Women's Blazer",                         3299),
        ("Jockey Men's Cotton T-Shirt Pack of 3",     1199),
        ("Peter England Men's Chinos",                 1899),
        ("Global Desi Women's Maxi Dress",             2199),
        ("Skechers Men's Go Walk 6 Sneakers",          4999),
        ("Van Heusen Women's Formal Trousers",         2299),
    ],
    "appliances": [
        ("Philips HL7707 750W Mixer Grinder",          3499),
        ("Havells Cista 1200W Air Fryer",              6999),
        ("Bajaj Majesty DX-7 1000W Room Heater",      2799),
        ("Prestige PKPW 500W Induction Cooktop",       2299),
        ("Usha Instafresh 35L OTG",                   7499),
        ("Kent Grand Plus RO Water Purifier",         14999),
        ("Pigeon Favourite Electric Kettle 1.5L",      699),
        ("Orient Electric Aris Plus BLDC Ceiling Fan", 5499),
        ("LG 7 kg 5 Star Inverter Washing Machine",  37999),
        ("Crompton Greaves LED Slim Panel 15W",         299),
    ],
    "books": [
        ("Atomic Habits by James Clear",                399),
        ("The Psychology of Money by Morgan Housel",   399),
        ("Rich Dad Poor Dad by Robert Kiyosaki",       299),
        ("Deep Work by Cal Newport",                   499),
        ("Zero to One by Peter Thiel",                 449),
    ],
    "sports": [
        ("Cosco Champion Basketball Size 7",          1799),
        ("Yonex Muscle Power 2 Badminton Racquet",    1299),
        ("Nivia Football Storm Size 5",                799),
        ("Decathlon Resistance Band Set of 5",        1299),
        ("Strauss Yoga Mat 6mm with Carry Strap",      699),
    ],
}

# Two demo laptops appended as ASIN051 / ASIN052 so existing ASINs don't shift.
# Fixed prices (no ±10% variance) so the right-size demo numbers stay stable.
DEMO_LAPTOPS = [
    ("ASUS ROG Strix G16 Gaming Laptop (RTX 4060, Core i7)", 89990, 14),
    ("Lenovo IdeaPad Slim 3 Laptop (Core i5, 16GB)",         41990, 8),
]

# Usage profiles power Predictive Return Prevention (right-sizing): the AI
# compares each product against how THIS shopper actually uses their devices.
# (persona_label, usage_profile, starting_green_credits_balance)
PERSONAS = {
    1: ("Office / Casual",    ["web browsing", "video streaming", "office work", "video calls"], 55),
    2: ("Gamer / Power user", ["AAA gaming", "video editing", "3D rendering", "live streaming"], 340),
    3: ("Student",            ["note-taking", "online research", "light study", "budget-conscious"], 80),
}
DEFAULT_PROFILE = ["general shopping", "everyday use"]

INDIAN_NAMES = [
    "Aarav Sharma",
    "Priya Nair",
    "Rahul Verma",
    "Sneha Iyer",
    "Vikram Mehta",
    "Ananya Gupta",
    "Rohan Joshi",
    "Kavya Reddy",
    "Arjun Patel",
    "Divya Krishnan",
]

EMAILS = [
    "aarav.sharma91@gmail.com",
    "priya.nair.k@outlook.com",
    "rahul.verma27@yahoo.in",
    "sneha.iyer88@gmail.com",
    "vikram.mehta.tech@gmail.com",
    "ananya.gupta99@hotmail.com",
    "rohan.joshi.dev@gmail.com",
    "kavya.reddy2k@gmail.com",
    "arjun.patel.in@outlook.com",
    "divya.krish@gmail.com",
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def random_past_datetime(days: int = 90) -> str:
    delta = timedelta(
        days=random.randint(0, days),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )
    return (datetime.utcnow() - delta).isoformat() + "Z"


def image_urls(return_id: str, count: int = None) -> list:
    count = count or random.randint(2, 3)
    return [
        f"https://hackon-images.s3.amazonaws.com/returns/{return_id}_{i}.jpg"
        for i in range(1, count + 1)
    ]


def weighted_grade() -> str:
    return random.choices(GRADES, weights=GRADE_WEIGHTS, k=1)[0]


# ─── Build products list ──────────────────────────────────────────────────────

def build_products() -> list:
    items = []
    asin_counter = 1

    for category, entries in PRODUCT_DATA.items():
        for product_name, base_price in entries:
            asin = f"ASIN{str(asin_counter).zfill(3)}"
            avg_rr = random.randint(5, 35)
            keep_rate = max(0, min(100, 100 - avg_rr - random.randint(-5, 10)))

            # Price with slight variance ±10%
            price = int(base_price * random.uniform(0.90, 1.10))

            items.append({
                "asin":              asin,
                "product_name":      product_name,
                "category":          category,
                "avg_return_rate":   avg_rr,
                "top_return_reasons": random.sample(RETURN_REASONS, random.randint(2, 3)),
                "keep_rate_score":   keep_rate,
                "seller_id":         f"SELLER{str(random.randint(1, 10)).zfill(3)}",
                "price_inr":         Decimal(str(price)),
            })
            asin_counter += 1

    # Demo laptops (ASIN051 / ASIN052) — fixed prices for the right-size demo.
    for product_name, base_price, avg_rr in DEMO_LAPTOPS:
        asin = f"ASIN{str(asin_counter).zfill(3)}"
        keep_rate = max(0, min(100, 100 - avg_rr - random.randint(-5, 10)))
        items.append({
            "asin":               asin,
            "product_name":       product_name,
            "category":           "electronics",
            "avg_return_rate":    avg_rr,
            "top_return_reasons": ["not as described", "changed my mind"],
            "keep_rate_score":    keep_rate,
            "seller_id":          "SELLER001",
            "price_inr":          Decimal(str(base_price)),
        })
        asin_counter += 1

    return items


# ─── Build returns list ───────────────────────────────────────────────────────

def build_returns(asins: list) -> list:
    items = []
    for i in range(1, 201):
        ret_id = f"RET{str(i).zfill(3)}"
        grade  = weighted_grade()
        items.append({
            "return_id":           ret_id,
            "user_id":             f"USER{str(random.randint(1, 10)).zfill(3)}",
            "asin":                random.choice(asins),
            "reason_code":         random.choice(RETURN_REASONS),
            "grade":               grade,
            "redirect_path":       random.choice(REDIRECT_PATHS),
            "green_credits_issued": GREEN_CREDITS[grade],
            "timestamp":           random_past_datetime(90),
            "image_urls":          image_urls(ret_id),
        })
    return items


# ─── Build users list ─────────────────────────────────────────────────────────

def build_users(asins: list, return_ids: list) -> list:
    items = []
    for i in range(1, 11):
        idx = i - 1
        persona, profile, balance = PERSONAS.get(
            i, ("General Shopper", DEFAULT_PROFILE, random.randint(0, 500))
        )
        items.append({
            "user_id":             f"USER{str(i).zfill(3)}",
            "name":                INDIAN_NAMES[idx],
            "email":               EMAILS[idx],
            "persona":             persona,
            "usage_profile":       profile,
            "purchase_history":    random.sample(asins, random.randint(5, 10)),
            "return_history":      random.sample(return_ids, random.randint(2, 5)),
            "green_credits_balance": balance,
            "wishlist_asins":      random.sample(asins, random.randint(3, 5)),
        })
    return items


# ─── Build a small, consistent Green Credits ledger for USER001 ───────────────
# So the Impact page shows a populated, reconciled history out of the box
# (final balance 55 matches USER001's seeded green_credits_balance).

def build_seed_ledger() -> list:
    entries = [
        ("credit", 50, "ReLife return — Amazon Renewed (boAt Rockerz 450)"),
        ("credit", 35, "ReLife return — Peer-to-Peer Resale (Levi's 511 Jeans)"),
        ("debit",  50, "Redeemed: ₹50 Amazon Voucher"),
        ("credit", 20, "ReLife return — Donate to NGO (Philips Mixer)"),
    ]
    items, bal = [], 0
    for n, (kind, amount, reason) in enumerate(entries, start=1):
        bal = bal + amount if kind == "credit" else bal - amount
        txn_id = f"CTX-SEED-{str(n).zfill(2)}"
        items.append({
            "return_id":     txn_id,
            "user_id":       "USER001",
            "record_type":   "credit_txn",
            "txn_id":        txn_id,
            "type":          kind,
            "amount":        amount,
            "reason":        reason,
            "balance_after": bal,
            "ref":           "",
            "created_at":    random_past_datetime(30),
        })
    return items


# ─── Seed helpers ─────────────────────────────────────────────────────────────

def batch_write(table, items: list):
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=== ReLoop DynamoDB Seeder — Amazon HackOn 6.0 ===\n")

    try:
        # ── TABLE 1: products ──────────────────────────────────────────────
        print("[1/3] Seeding 'products' table...")
        products_table = dynamodb.Table("products")
        products       = build_products()
        batch_write(products_table, products)
        print(f"      ✓ Inserted {len(products)} items into 'products'\n")

        asins      = [p["asin"] for p in products]
        return_ids = [f"RET{str(i).zfill(3)}" for i in range(1, 201)]

        # ── TABLE 2: returns ───────────────────────────────────────────────
        print("[2/3] Seeding 'returns' table...")
        returns_table = dynamodb.Table("returns")
        returns       = build_returns(asins)
        returns      += build_seed_ledger()   # seed USER001's credit ledger
        batch_write(returns_table, returns)
        print(f"      ✓ Inserted {len(returns)} items into 'returns'\n")

        # ── TABLE 3: users ─────────────────────────────────────────────────
        print("[3/3] Seeding 'users' table...")
        users_table = dynamodb.Table("users")
        users       = build_users(asins, return_ids)
        batch_write(users_table, users)
        print(f"      ✓ Inserted {len(users)} items into 'users'\n")

        print("✅  Seeding complete!")

    except dynamodb.meta.client.exceptions.ResourceNotFoundException as e:
        print(f"\n❌  Table not found — make sure all 3 tables exist in DynamoDB first.\n    Detail: {e}")
    except Exception as e:
        print(f"\n❌  Unexpected error during seeding:\n    {type(e).__name__}: {e}")
        raise


if __name__ == "__main__":
    main()
