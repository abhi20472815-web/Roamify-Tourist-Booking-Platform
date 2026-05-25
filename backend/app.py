from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import db
from models.user import UserModel
from routes.auth_routes import auth_bp
from routes.package_routes import package_bp
from routes.booking_routes import booking_bp
from routes.admin_routes import admin_bp
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend API calls
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(package_bp, url_prefix='/api/packages')
app.register_blueprint(booking_bp, url_prefix='/api/bookings')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple API health check endpoint."""
    return jsonify({
        "status": "success",
        "message": "Tourist Booking API is up and running!",
        "database": "connected" if db is not None else "failed"
    }), 200

def seed_database():
    """Seed default admin user and initial high-quality travel packages if database is empty."""
    try:
        # 1. Seed Admin User
        admin_email = "admin@tourist.com"
        existing_admin = db.users.find_one({"email": admin_email})
        if not existing_admin:
            hashed_pwd = UserModel.hash_password("Admin@12345")
            db.users.insert_one({
                "name": "System Admin",
                "email": admin_email,
                "password": hashed_pwd,
                "role": "admin",
                "created_at": datetime.utcnow()
            })
            print("[SEED] Default admin seeded successfully: admin@tourist.com / Admin@12345")
        
        # Detect if we need to convert old USD packages to INR (purge collection if price of Bali is 799)
        sample_bali = db.packages.find_one({"title": {"$regex": "Bali", "$options": "i"}})
        if sample_bali and sample_bali.get('price', 0) < 10000:
            print("[CONVERSION] Detected legacy USD pricing. Purging database to perform INR conversion...")
            db.packages.delete_many({})
            db.bookings.delete_many({})  # Purge older bookings to prevent price mismatches
        
        # Hot-patch: Sync Tokyo package images if it contains any broken Unsplash photo IDs
        tokyo_pkg = db.packages.find_one({"title": {"$regex": "Tokyo", "$options": "i"}})
        if tokyo_pkg:
            images_str = str(tokyo_pkg.get('images', []))
            if "photo-1540959733332-eab4deceeaf7" in images_str or "photo-1490761668535-3147043a103e" in images_str:
                print("[SYNC] Hot-patching legacy broken Tokyo photo references in database...")
                db.packages.update_one(
                    {"_id": tokyo_pkg["_id"]},
                    {"$set": {
                        "images": [
                            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
                        ]
                    }}
                )
        # Hot-patch: Sync Kerala package images if it contains duplicate Ladakh photos
        kerala_pkg = db.packages.find_one({"title": {"$regex": "Kerala", "$options": "i"}})
        if kerala_pkg:
            images_str = str(kerala_pkg.get('images', []))
            if "photo-1544735716-392fe2489ffa" in images_str:
                print("[SYNC] Hot-patching duplicate photo references for Kerala in database...")
                db.packages.update_one(
                    {"_id": kerala_pkg["_id"]},
                    {"$set": {
                        "images": [
                            "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1571538502660-394c8e76bb06?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&w=800&q=80"
                        ]
                    }}
                )

        # Hot-patch: Sync Goa package images if it contains duplicate Bali photos
        goa_pkg = db.packages.find_one({"title": {"$regex": "Goa", "$options": "i"}})
        if goa_pkg:
            images_str = str(goa_pkg.get('images', []))
            if "photo-1507525428034-b723cf961d3e" in images_str:
                print("[SYNC] Hot-patching duplicate photo references for Goa in database...")
                db.packages.update_one(
                    {"_id": goa_pkg["_id"]},
                    {"$set": {
                        "images": [
                            "https://images.unsplash.com/photo-1614082242765-7c98cf0f3df3?auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80"
                        ]
                    }}
                )

        # Hot-patch: Sync Paris package images if it contains legacy broken photos
        paris_pkg = db.packages.find_one({"title": {"$regex": "Paris", "$options": "i"}})
        if paris_pkg:
            images_str = str(paris_pkg.get('images', []))
            if "photo-1509060464153-4466739f78ad" in images_str:
                print("[SYNC] Hot-patching legacy photo references for Paris in database...")
                db.packages.update_one(
                    {"_id": paris_pkg["_id"]},
                    {"$set": {
                        "images": [
                            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1499856871958-5b994751581a?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=800&q=80"
                        ]
                    }}
                )
        
        # 2. Seed Default Travel Packages
        if db.packages.count_documents({}) == 0:
            sample_packages = [
                {
                    "title": "Bali Tropical Paradise Escape",
                    "description": "Indulge in a breathtaking tropical getaway to the island of Bali, Indonesia. This curated luxury vacation offers a perfect mix of serene emerald beaches, vibrant cultural temples, historic rice terraces, and modern private villa accommodations. Experience Ubud's cultural heart, the gorgeous Nusa Penida beaches, and thrilling watersports.",
                    "price": 64999.0,
                    "duration": "6 Days / 5 Nights",
                    "rating": 4.9,
                    "location": "Bali, Indonesia",
                    "images": [
                        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Free Wi-Fi", "5-Star Villa Resort", "All Meals Included", "English-speaking Guide", "Airport Transfers"],
                    "itinerary": [
                        {"day": 1, "title": "Welcome to Bali & Villa Check-in", "description": "Arrival at Ngurah Rai International Airport. Meet and greet with our private guide, followed by checking in to a luxury private pool resort in Ubud. Spend your evening relaxing and enjoy a welcome beach buffet dinner."},
                        {"day": 2, "title": "Ubud Monkey Forest & Tegalalang Rice Terraces", "description": "Start the day with a scenic tour of Ubud. Visit the sacred Monkey Forest sanctuary, swing over the scenic Tegalalang Rice Terraces, and enjoy a traditional Balinese organic lunch overlooking the valleys."},
                        {"day": 3, "title": "Temple Pilgrimage & Mount Batur Volcano", "description": "Explore the famous Tirta Empul holy spring water temple, followed by a scenic drive to Kintamani to enjoy majestic panoramic views of Mount Batur Volcano and Lake Batur with a volcanic buffet lunch."},
                        {"day": 4, "title": "Nusa Penida Island Tour", "description": "Early morning speedboat transfer to Nusa Penida. Visit the iconic Kelingking Beach (T-Rex Cliff), swim at Crystal Bay, and capture photos at Angel's Billabong and Broken Beach. Return to main island in the evening."},
                        {"day": 5, "title": "Tanah Lot Sea Temple Sunset", "description": "Spend a lazy morning shopping for local Balinese handicrafts. In the afternoon, visit the legendary cliffside Tanah Lot Temple and watch the spectacular orange sunset over the Indian Ocean."},
                        {"day": 6, "title": "Departure & Spa Farewell", "description": "Enjoy a floating breakfast in your private pool. Indulge in a signature 2-hour Balinese massage and spa treatment before checking out and taking your private transfer back to the airport."}
                    ]
                },
                {
                    "title": "Swiss Alps Winter Adventure",
                    "description": "Experience the ultimate alpine luxury and snow-drenched adventure in the magnificent Swiss Alps. Stay in the legendary mountain resort village of Zermatt, ride the world-renowned Glacier Express, hike pristine mountain passes, and feast on delicious Swiss fondues under the shadow of the Matterhorn Peak.",
                    "price": 139999.0,
                    "duration": "7 Days / 6 Nights",
                    "rating": 4.8,
                    "location": "Zermatt, Switzerland",
                    "images": [
                        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["High-Speed Wi-Fi", "Alpine Chalet Stay", "Buffet Breakfast & Dinners", "Ski Passes", "Cable Car Access"],
                    "itinerary": [
                        {"day": 1, "title": "Arrival in Zurich & Scenic Train to Zermatt", "description": "Arrive in Zurich. Board the scenic Swiss Federal Railway train to the car-free mountain village of Zermatt. Check into your cozy alpine resort and enjoy high-end heated pool facilities."},
                        {"day": 2, "title": "Matterhorn Glacier Paradise", "description": "Ride Europe's highest cable car to the Matterhorn Glacier Paradise (3883m). Witness breathtaking peaks across France, Italy, and Switzerland. Evening Swiss cheese fondue dinner."},
                        {"day": 3, "title": "Skiing & Snowboarding on Alpine Slopes", "description": "A full day dedicated to snow activities! Receive professional coaching or enjoy self-guided skiing/snowboarding on intermediate and advanced slopes. Ski gear rentals are fully covered."},
                        {"day": 4, "title": "Glacier Express Panoramic Ride", "description": "Board the world's slowest express train - the Glacier Express. Travel across breathtaking bridges, deep valleys, and snowy spiral tunnels through the heart of the mountains. Overnight in St. Moritz."},
                        {"day": 5, "title": "St. Moritz Frozen Lake & Luxury Sights", "description": "Stroll around the famous frozen lake of St. Moritz. Take a horse-drawn carriage ride and explore the upscale boutiques, chocolatiers, and galleries of this historic winter playground."},
                        {"day": 6, "title": "Mount Pilatus Golden Roundtrip", "description": "Travel to Lucerne. Board a boat cruise across Lake Lucerne, then ascend Mount Pilatus on the world's steepest cogwheel railway. Descend via panoramic gondolas in the afternoon."},
                        {"day": 7, "title": "Zurich Shopping & Departure", "description": "Return to Zurich for souvenir shopping along the famous Bahnhofstrasse. Transfer to Zurich Airport for your international flight home."}
                    ]
                },
                {
                    "title": "Historical Wonders of India",
                    "description": "Embark on an enchanting journey through India's Golden Triangle. Step back in time as you explore the rich Mughal heritage, the majestic white-marble Taj Mahal in Agra, the royal palaces of Jaipur, and the bustling, vibrant historic spice markets of Old Delhi.",
                    "price": 14999.0,
                    "duration": "4 Days / 3 Nights",
                    "rating": 4.7,
                    "location": "Agra & Jaipur, India",
                    "images": [
                        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Free Wi-Fi", "Heritage Palace Hotel", "Breakfast Buffet", "Private AC Transport", "Certified Historian Guide"],
                    "itinerary": [
                        {"day": 1, "title": "Old Delhi Heritage Walk & Agra Transfer", "description": "Morning arrival in New Delhi. Tour the historic Red Fort, take a rickshaw ride through the narrow lanes of Chandni Chowk spice market, and transfer to Agra via the Yamuna Expressway. Check into a heritage luxury hotel."},
                        {"day": 2, "title": "Taj Mahal Sunrise & Agra Fort Tour", "description": "Catch the majestic sunrise over the stunning white-marble Taj Mahal. Explore the massive red sandstone Agra Fort, and visit local marble-inlay workshops. Drive to the Pink City of Jaipur in the afternoon."},
                        {"day": 3, "title": "Amer Fort Elephant Ride & Palace of Winds", "description": "Ascend the hilltop Amer Fort. Visit the iconic Hawa Mahal (Palace of Winds), the City Palace museum, and the ancient Jantar Mantar observatory. Enjoy a royal Rajasthani Thali dinner with live folk dances."},
                        {"day": 4, "title": "Jaipur Local Bazaars & Departure", "description": "Spend the morning shopping for precious gemstones, block-printed textiles, and handmade pottery in Jaipur's famous Johri Bazaar. Depart for Delhi airport in the afternoon for your flight home."}
                    ]
                },
                {
                    "title": "Tokyo Modern Lights & Shinto Culture",
                    "description": "Immerse yourself in the incredible contrasts of Tokyo, Japan. Discover high-tech glowing skyscrapers, robotic innovations, and futuristic teamLab digital exhibits alongside ancient Shinto shrines, quiet tranquil gardens, traditional sushi cooking masterclasses, and Mount Fuji vistas.",
                    "price": 114999.0,
                    "duration": "8 Days / 7 Nights",
                    "rating": 4.9,
                    "location": "Tokyo & Kyoto, Japan",
                    "images": [
                        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Pocket Wi-Fi Device", "Premium 4-Star Hotels", "Daily Culinary Tastings", "Bullet Train Pass", "English-speaking Local Guide"],
                    "itinerary": [
                        {"day": 1, "title": "Arrival in Tokyo & Shinjuku Neon Night Walk", "description": "Arrive at Haneda/Narita airport, transfer via limousine bus to your hotel. Meet your guide for a walking tour of Shinjuku's neon-lit alleyways and enjoy a premium Japanese Wagyu beef dinner."},
                        {"day": 2, "title": "Historic Asakusa & teamLab Planets Digital Exhibit", "description": "Visit Tokyo's oldest temple, Senso-ji, in historic Asakusa. Contrast the tradition by walking into the mind-bending, immersive teamLab Planets digital art installation in Toyosu. Dine at a local Izakaya."},
                        {"day": 3, "title": "Meiji Shrine, Harajuku & Shibuya Crossing", "description": "Walk through the quiet cedar forest of Meiji Jingu Shrine. Explore Harajuku's quirky Takeshita Street fashion hub, then experience Shibuya Crossing, the world's busiest pedestrian intersection, from a premium sky observatory."},
                        {"day": 4, "title": "Mount Fuji & Hakone Lake Ashi Cruise", "description": "Take a luxury coach to Mt. Fuji 5th Station. Travel to Hakone, cruise on a pirate ship across the volcanic Lake Ashi, and take a ropeway ride up Mount Owakudani to taste sulfur-boiled black eggs. Sleep in a traditional Ryokan with natural hot springs (Onsen)."},
                        {"day": 5, "title": "Bullet Train (Shinkansen) to Kyoto & Gion District", "description": "Board the famous Shinkansen bullet train reaching speeds of 320 km/h. Arrive in Kyoto. Stroll through the historic Gion district, and catch a rare glimpse of Geishas walking to evening appointments."},
                        {"day": 6, "title": "Fushimi Inari Torii Gates & Arashiyama Bamboo Grove", "description": "Hike through thousands of orange torii gates at Fushimi Inari Shrine. In the afternoon, walk the peaceful pathways of the Arashiyama Bamboo Grove and visit the iconic Golden Pavilion temple (Kinkaku-ji)."},
                        {"day": 7, "title": "Traditional Tea Ceremony & Sushi Masterclass", "description": "Participate in an authentic Zen green tea ceremony. In the afternoon, learn the delicate art of making Nigiri sushi from a professional sushi chef, followed by enjoying your culinary creations."},
                        {"day": 8, "title": "Kyoto Crafts & Departure", "description": "Spend morning shopping for fine Kiyomizu-yaki ceramics and green tea sweets. Board the bullet train back to Tokyo international airport for departure."}
                    ]
                },
                {
                    "title": "Ladakh Himalayan Heights Adventure",
                    "description": "Embark on an adventure of a lifetime to Ladakh, the Land of High Passes. Explore high-altitude cold deserts, witness majestic turquoise lakes, cross the Khardung La Pass (one of the highest motorable roads in the world), and stay in cozy premium chalets under a pristine canopy of stars.",
                    "price": 34999.0,
                    "duration": "6 Days / 5 Nights",
                    "rating": 4.8,
                    "location": "Leh & Ladakh, India",
                    "images": [
                        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1596701062351-df5f8adc55b9?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Free Wi-Fi", "Heated Cozy Stays", "Inner Line Permits", "Oxygen Cylinders", "AC Private Sedan"],
                    "itinerary": [
                        {"day": 1, "title": "Leh Airport Arrival & Absolute Rest", "description": "Arrive at Kushok Bakula Rimpochee Airport, Leh. Private transfer to your hotel. Spend the entire day resting to acclimate to the high altitude (11,500 feet). Evening light stroll around Leh bazaar."},
                        {"day": 2, "title": "Magnetic Hill, Confluence & Hall of Fame", "description": "Visit the mysterious Magnetic Hill, see the gorgeous confluence of the Indus and Zanskar Rivers in Nimmu, and visit the historic Hall of Fame military museum. Return to Leh for overnight stay."},
                        {"day": 3, "title": "Leh to Nubra Valley via Khardung La Pass", "description": "Drive to the spectacular Nubra Valley crossing the mighty Khardung La Pass at 17,582 ft. Visit the massive Diskit Monastery. Ride double-humped Bactrian camels on the cold desert sand dunes of Hunder."},
                        {"day": 4, "title": "Nubra Valley to Pangong Tso Lake via Shyok", "description": "Early departure to the world-famous saltwater Pangong Tso Lake (14,270 ft) bordering India and China. Witness the lake change colors from azure blue to deep green. Stay in luxury dome tents near the lake."},
                        {"day": 5, "title": "Pangong Lake back to Leh via Chang La Pass", "description": "Catch a spectacular sunrise over Pangong Lake. Drive back to Leh crossing the high Chang La Pass (17,590 ft). Visit the majestic Thiksey Monastery on the way. Check back into your Leh hotel."},
                        {"day": 6, "title": "Acclimatized Departure", "description": "Enjoy a healthy local hot breakfast. Board your private transfer to Leh airport for your flight home with beautiful mountain memories."}
                    ]
                },
                {
                    "title": "Kerala Backwaters & Munnar Hills Cruise",
                    "description": "Discover Munnar's rolling emerald tea estates and the serene backwater waterways of Alleppey. Cruise on a private traditional wooden houseboat, enjoy Ayurvedic culinary wellness, and experience rich heritage art forms like Kathakali and Kalaripayattu.",
                    "price": 24999.0,
                    "duration": "5 Days / 4 Nights",
                    "rating": 4.7,
                    "location": "Kerala, India",
                    "images": [
                        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1571538502660-394c8e76bb06?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Free Wi-Fi", "Luxury Houseboat Cruise", "Traditional Sadya Meals", "Private AC Cab", "Scenic Tea Valley Stays"],
                    "itinerary": [
                        {"day": 1, "title": "Cochin Arrival & Transfer to Munnar Tea Gardens", "description": "Arrive at Cochin Airport. Drive through winding roads flanked by rubber estates and waterfalls to Munnar. Check into your resort overlooking mist-covered tea gardens. Evening walk in spice plantations."},
                        {"day": 2, "title": "Munnar Tea Museum & Eravikulam National Park", "description": "Explore Eravikulam National Park to spot the endangered Nilgiri Tahr mountain goat. Visit the Munnar Tea Museum to see tea-processing demonstrations. Return to resort for campfire dinner."},
                        {"day": 3, "title": "Munnar to Alleppey Houseboat Check-in", "description": "Drive down to Alleppey, the Venice of the East. Check into a luxurious private wooden houseboat. Cruise through scenic palm-fringed backwaters, viewing village life. All traditional Kerala meals served on board."},
                        {"day": 4, "title": "Alleppey back to Cochin & Fort Kochi Sightseeing", "description": "Checkout from houseboat. Drive to Fort Kochi. Visit the historic Chinese Fishing Nets, Santa Cruz Cathedral, and enjoy an evening live Kathakali dance performance. Sleep in Fort Kochi heritage hotel."},
                        {"day": 5, "title": "Cochin Departure", "description": "Spend morning shopping for organic cardamom, pepper, banana chips, and handloom sarees. Private transfer to Kochi airport for departure."}
                    ]
                },
                {
                    "title": "Goa Sun-Kissed Beaches & Heritage Tours",
                    "description": "Experience the ultimate beach escape to Goa. Discover sandy beaches, historical Portuguese churches, spice plantations, and thrilling water activities. Enjoy luxury oceanfront resort stays and mouthwatering Goan fish curries.",
                    "price": 18499.0,
                    "duration": "4 Days / 3 Nights",
                    "rating": 4.6,
                    "location": "Goa, India",
                    "images": [
                        "https://images.unsplash.com/photo-1614082242765-7c98cf0f3df3?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Free Wi-Fi", "Ocean-View Resort", "Scuba Diving & Watersports", "Self-Drive Scooters", "Buffet Breakfasts"],
                    "itinerary": [
                        {"day": 1, "title": "North Goa Beaches & Sunset Clubbing", "description": "Arrive at Mopa/Dabolim Airport. Private transfer to your beachside resort in Calangute. Spend the afternoon relaxing. In the evening, visit Anjuna beach for a breathtaking sunset followed by dinner at a shack."},
                        {"day": 2, "title": "Island Boat Cruise, Scuba Diving & Parasailing", "description": "Early morning boat transfer to Grand Island. Enjoy professional-guided scuba diving in shallow tropical reefs. Participate in thrilling parasailing, jet skiing, and banana boat rides on Baga Beach."},
                        {"day": 3, "title": "Old Goa Churches, Basilica & Spice Farm Tour", "description": "Explore South Goa's heritage. Visit the UNESCO World Heritage Basilica of Bom Jesus holding the mortal remains of St. Francis Xavier. Take a guided tour of a tropical spice plantation with a Goan buffet lunch."},
                        {"day": 4, "title": "Souvenir Shopping & Departure", "description": "Spend the morning shopping for cashews, local Feni, and beachwear. Checkout and board your private transfer back to the airport."}
                    ]
                },
                {
                    "title": "Parisian Romance & Eiffel Tower Vistas",
                    "description": "Indulge in the ultimate romantic European escape to Paris, the City of Light. Stay in a luxury boutique hotel with Eiffel Tower views, cruise the historic Seine River, see Louvre masterpieces, and day-trip to the opulent Palace of Versailles.",
                    "price": 145000.0,
                    "duration": "6 Days / 5 Nights",
                    "rating": 4.9,
                    "location": "Paris, France",
                    "images": [
                        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1499856871958-5b994751581a?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=800&q=80"
                    ],
                    "facilities": ["Pocket Wi-Fi Device", "Luxury Eiffel-View Hotel", "Seine River Dinner Cruise", "Louvre Fast-Track Passes", "Bilingual Expert Guide"],
                    "itinerary": [
                        {"day": 1, "title": "Welcome to Paris & River Seine Cruise", "description": "Arrival at Charles de Gaulle Airport. Private Mercedes transfer to your hotel. In the evening, enjoy a premium 3-course dinner cruise on a glass-dome boat sailing along the River Seine."},
                        {"day": 2, "title": "Eiffel Tower Access & Arc de Triomphe", "description": "Ascend to the top deck of the Eiffel Tower for panoramic views of Paris. Walk along the Champs-Élysées, stop at the Arc de Triomphe, and enjoy a traditional French bistro lunch."},
                        {"day": 3, "title": "Louvre Museum Treasures & Notre Dame Cathedral", "description": "Enjoy skip-the-line access to the Louvre Museum. Discover the Mona Lisa, Winged Victory, and Venus de Milo. In the afternoon, visit the Latin Quarter and view Notre Dame Cathedral."},
                        {"day": 4, "title": "Palace of Versailles Grand Palace & Gardens", "description": "Take a premium day-trip to the opulent Palace of Versailles. Guided tour of the Hall of Mirrors and Royal Apartments. Wander the massive fountains and landscaped gardens."},
                        {"day": 5, "title": "Montmartre Art Village & Sacré-Cœur Basilica", "description": "Stroll the cobblestone streets of artistic Montmartre, once home to Picasso and Van Gogh. Visit the white-dome Sacré-Cœur Basilica. Evening cabaret dinner show at the Lido/Moulin Rouge."},
                        {"day": 6, "title": "Macaron Tasting & CDG Airport Departure", "description": "Participate in a private French pastry tasting class. Purchase fine chocolates and fashion items before checking out for your private transfer back to the airport."}
                    ]
                }
            ]
            db.packages.insert_many(sample_packages)
            print("[SEED] Default travel packages seeded successfully!")
            
    except Exception as e:
        print(f"[SEED ERROR] Error seeding database: {str(e)}")

# Invoke seeding on startup
seed_database()

if __name__ == '__main__':
    # Start flask app
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
