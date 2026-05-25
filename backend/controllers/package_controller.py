from flask import request, jsonify, g
from bson.objectid import ObjectId
from db import db

def get_packages():
    """Get all packages with optional search and filters."""
    try:
        query = {}
        
        # Get query parameters
        search = request.args.get('search', '').strip()
        max_price = request.args.get('max_price')
        location = request.args.get('location', '').strip()
        
        # Search filter (matches title, location or description)
        if search:
            query['$or'] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
            
        if location:
            query['location'] = {"$regex": location, "$options": "i"}
            
        # Price filter
        if max_price:
            try:
                query['price'] = {"$lte": float(max_price)}
            except ValueError:
                pass
                
        # Fetch and serialize packages
        packages = list(db.packages.find(query))
        for pkg in packages:
            pkg['_id'] = str(pkg['_id'])
            
        return jsonify(packages), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching packages: {str(e)}"}), 500

def get_package_by_id(package_id):
    """Get details of a single package."""
    try:
        if not ObjectId.is_valid(package_id):
            return jsonify({"message": "Invalid package ID format!"}), 400
            
        package = db.packages.find_one({"_id": ObjectId(package_id)})
        if not package:
            return jsonify({"message": "Tour package not found!"}), 404
            
        package['_id'] = str(package['_id'])
        return jsonify(package), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching package details: {str(e)}"}), 500

def create_package():
    """Create a new tour package (Admin only)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Package details are required!"}), 400
            
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        price = data.get('price')
        duration = data.get('duration', '').strip()
        location = data.get('location', '').strip()
        
        # Standard validation
        if not title or not description or price is None or not duration or not location:
            return jsonify({"message": "Title, description, price, duration, and location are required!"}), 400
            
        try:
            price = float(price)
        except ValueError:
            return jsonify({"message": "Price must be a valid number!"}), 400
            
        rating = data.get('rating', 5.0)
        try:
            rating = float(rating)
        except ValueError:
            rating = 5.0
            
        # Optional fields with robust fallbacks
        images = data.get('images', [])
        if not isinstance(images, list) or len(images) == 0:
            # Fallback scenic placeholder images
            images = ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"]
            
        facilities = data.get('facilities', ["WiFi", "Hotel", "Meals", "Tour Guide"])
        itinerary = data.get('itinerary', [
            {"day": 1, "title": "Arrival & Leisure", "description": "Arrive at destination, check into hotel, and spend evening exploring local sights."},
            {"day": 2, "title": "Sightseeing Tour", "description": "Full day tour of major attractions and cultural heritage landmarks."},
            {"day": 3, "title": "Adventure & Departure", "description": "Morning outdoor activities, souvenir shopping, and checkout for departure."}
        ])
        
        new_pkg = {
            "title": title,
            "description": description,
            "price": price,
            "duration": duration,
            "rating": rating,
            "location": location,
            "images": images,
            "facilities": facilities,
            "itinerary": itinerary
        }
        
        result = db.packages.insert_one(new_pkg)
        new_pkg['_id'] = str(result.inserted_id)
        
        return jsonify({
            "message": "Tour package created successfully!",
            "package": new_pkg
        }), 201
        
    except Exception as e:
        return jsonify({"message": f"Error creating package: {str(e)}"}), 500

def update_package(package_id):
    """Update an existing tour package (Admin only)."""
    try:
        if not ObjectId.is_valid(package_id):
            return jsonify({"message": "Invalid package ID format!"}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({"message": "Update details are required!"}), 400
            
        package = db.packages.find_one({"_id": ObjectId(package_id)})
        if not package:
            return jsonify({"message": "Tour package not found!"}), 404
            
        # Parse fields to update
        update_fields = {}
        
        if 'title' in data:
            update_fields['title'] = data['title'].strip()
        if 'description' in data:
            update_fields['description'] = data['description'].strip()
        if 'duration' in data:
            update_fields['duration'] = data['duration'].strip()
        if 'location' in data:
            update_fields['location'] = data['location'].strip()
            
        if 'price' in data:
            try:
                update_fields['price'] = float(data['price'])
            except ValueError:
                return jsonify({"message": "Price must be a valid number!"}), 400
                
        if 'rating' in data:
            try:
                update_fields['rating'] = float(data['rating'])
            except ValueError:
                pass
                
        if 'images' in data and isinstance(data['images'], list):
            update_fields['images'] = data['images']
            
        if 'facilities' in data and isinstance(data['facilities'], list):
            update_fields['facilities'] = data['facilities']
            
        if 'itinerary' in data and isinstance(data['itinerary'], list):
            update_fields['itinerary'] = data['itinerary']
            
        if not update_fields:
            return jsonify({"message": "No updates were provided!"}), 400
            
        db.packages.update_one(
            {"_id": ObjectId(package_id)},
            {"$set": update_fields}
        )
        
        updated_package = db.packages.find_one({"_id": ObjectId(package_id)})
        updated_package['_id'] = str(updated_package['_id'])
        
        return jsonify({
            "message": "Tour package updated successfully!",
            "package": updated_package
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error updating package: {str(e)}"}), 500

def delete_package(package_id):
    """Delete a tour package (Admin only)."""
    try:
        if not ObjectId.is_valid(package_id):
            return jsonify({"message": "Invalid package ID format!"}), 400
            
        package = db.packages.find_one({"_id": ObjectId(package_id)})
        if not package:
            return jsonify({"message": "Tour package not found!"}), 404
            
        # Delete package
        db.packages.delete_one({"_id": ObjectId(package_id)})
        
        # Also clean up/cancel bookings associated with this deleted package (optional, or just leave as is. Clean is better!)
        db.bookings.delete_many({"package_id": package_id})
        
        return jsonify({"message": "Tour package and associated bookings deleted successfully!"}), 200
        
    except Exception as e:
        return jsonify({"message": f"Error deleting package: {str(e)}"}), 500
