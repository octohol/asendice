from flask import jsonify, Response, Blueprint, request
from models import db, Game, Publisher, Category
from sqlalchemy.orm import Query

# Create a Blueprint for games routes
games_bp = Blueprint('games', __name__)

def get_games_base_query() -> Query:
    return db.session.query(Game).join(
        Publisher, 
        Game.publisher_id == Publisher.id, 
        isouter=True
    ).join(
        Category, 
        Game.category_id == Category.id, 
        isouter=True
    )

@games_bp.route('/api/games', methods=['GET'])
def get_games() -> Response:
    # Start with the base query for all games
    games_query = get_games_base_query()
    
    # Apply category filter if provided
    category_id = request.args.get('category_id', type=int)
    if category_id:
        games_query = games_query.filter(Game.category_id == category_id)
    
    # Apply publisher filter if provided
    publisher_id = request.args.get('publisher_id', type=int)
    if publisher_id:
        games_query = games_query.filter(Game.publisher_id == publisher_id)
    
    # Execute the query
    games_list_query = games_query.all()
    
    # Convert the results using the model's to_dict method
    games_list = [game.to_dict() for game in games_list_query]
    
    return jsonify(games_list)

@games_bp.route('/api/games/<int:id>', methods=['GET'])
def get_game(id: int) -> tuple[Response, int] | Response:
    # Use the base query and add filter for specific game
    game_query = get_games_base_query().filter(Game.id == id).first()
    
    # Return 404 if game not found
    if not game_query: 
        return jsonify({"error": "Game not found"}), 404
    
    # Convert the result using the model's to_dict method
    game = game_query.to_dict()
    
    return jsonify(game)

@games_bp.route('/api/categories', methods=['GET'])
def get_categories() -> Response:
    """Get all available categories for filtering"""
    categories = db.session.query(Category).all()
    categories_list = [{"id": cat.id, "name": cat.name} for cat in categories]
    return jsonify(categories_list)

@games_bp.route('/api/publishers', methods=['GET'])
def get_publishers() -> Response:
    """Get all available publishers for filtering"""
    publishers = db.session.query(Publisher).all()
    publishers_list = [{"id": pub.id, "name": pub.name} for pub in publishers]
    return jsonify(publishers_list)
