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
    # Get pagination parameters from query string
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    
    # Validate pagination parameters
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:  # Limit max per_page to prevent abuse
        per_page = 12
    
    # Use the base query and apply pagination
    games_query = get_games_base_query()
    paginated_games = games_query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # Convert the results using the model's to_dict method
    games_list = [game.to_dict() for game in paginated_games.items]
    
    # Return paginated response with metadata
    return jsonify({
        'games': games_list,
        'pagination': {
            'current_page': paginated_games.page,
            'per_page': paginated_games.per_page,
            'total': paginated_games.total,
            'total_pages': paginated_games.pages,
            'has_next': paginated_games.has_next,
            'has_prev': paginated_games.has_prev
        }
    })

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
