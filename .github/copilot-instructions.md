# Tailspin Toys Crowd Funding Development Guidelines

This is a crowdfunding platform for games with a developer theme. The application uses a Flask backend API with SQLAlchemy ORM for database interactions, and an Astro/Svelte frontend with Tailwind CSS for styling. Please follow these guidelines when contributing:

## Code standards

### Required Before Each Commit

- Run Python tests to ensure backend functionality
- For frontend changes, run builds in the client directory to verify build success and the end-to-end tests, to ensure everything works correctly
- When making API changes, update and run the corresponding tests to ensure everything works correctly
- When updating models, ensure database migrations are included if needed
- When adding new functionality, make sure you update the README
- Make sure all guidance in the Copilot Instructions file is updated with any relevant changes, including to project structure and scripts, and programming guidance
- Run automated formatting and linting tools on Python code:
  - `black server/` to format code
  - `isort server/` to organize imports
  - `flake8 server/` to check style compliance
  - `mypy server/ --ignore-missing-imports` to check types

### Global language guidance

- Use type hints for function parameters and return values for all languages which support them
- Add file header comments for all new files explaining their purpose
- Add comprehensive docstrings to all functions, classes, and modules following Google style format

### Python and Flask Patterns

- Use SQLAlchemy models for database interactions
- Use Flask blueprints for organizing routes
- Follow RESTful API design principles

#### Python Code Formatting Standards

- **Indentation**: Use 4 spaces for indentation (never tabs)
- **Line Length**: Maximum line length of 88 characters (Black formatter default)
- **Import Organization**: 
  - Standard library imports first
  - Third-party imports second
  - Local application imports last
  - Separate each group with a blank line
  - Use absolute imports when possible
- **Naming Conventions**:
  - Variables and functions: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_CASE`
  - Private methods/attributes: prefix with single underscore `_private_method`
  - Modules: lowercase with underscores if needed

#### Python Docstring Requirements

All functions, classes, and modules must include comprehensive docstrings using Google style format:

**Function Docstring Example:**
```python
def validate_game_data(title: str, description: str) -> bool:
    """Validates game data before saving to database.
    
    Args:
        title: The game title to validate
        description: The game description to validate
        
    Returns:
        True if validation passes, False otherwise
        
    Raises:
        ValueError: If title or description is empty
        
    Example:
        >>> validate_game_data("Chess", "Classic board game")
        True
    """
```

**Class Docstring Example:**
```python
class Game(BaseModel):
    """Represents a game in the crowdfunding platform.
    
    This class handles game data validation, database operations,
    and serialization for API responses.
    
    Attributes:
        title: The game's title
        description: Detailed description of the game
        star_rating: Average rating from 1-5 stars
        category: Foreign key reference to game category
        publisher: Foreign key reference to game publisher
    """
```

#### Code Pattern Examples

**Good Pattern - Type Hints and Validation:**
```python
from typing import Optional, Dict, Any

def create_game(title: str, description: str, category_id: int) -> Optional[Dict[str, Any]]:
    """Creates a new game with proper validation."""
    if not title or len(title) < 2:
        raise ValueError("Title must be at least 2 characters")
    
    game = Game(title=title, description=description, category_id=category_id)
    return game.to_dict()
```

**Bad Pattern - No Type Hints or Validation:**
```python
def create_game(title, description, category_id):
    game = Game(title=title, description=description, category_id=category_id)
    return game.to_dict()
```

### Svelte and Astro Patterns

- Use Svelte for interactive components
- Follow Svelte's reactive programming model
- Create reusable components when functionality is used in multiple places
- Use Astro for page routing and static content

### Styling

- Use Tailwind CSS classes for styling
- Maintain dark mode theme throughout the application
- Use rounded corners for UI elements
- Follow modern UI/UX principles with clean, accessible interfaces

### GitHub Actions workflows

- Follow good security practices
- Make sure to explicitly set the workflow permissions
- Add comments to document what tasks are being performed

## Scripts

- Several scripts exist in the `scripts` folder
- Use existing scripts to perform tasks rather than performing them manually
- Existing scripts:
    - `scripts/setup-env.sh`: Performs installation of all Python and Node dependencies
    - `scripts/run-server-tests.sh`: Calls setup-env, then runs all Python tests
    - `scripts/start-app.sh`: Calls setup-env, then starts both backend and frontend servers

## Automated Code Quality Tools

The repository includes automated formatting and linting tools:

- **Black**: Python code formatter (88-character line length)
- **isort**: Import statement organizer  
- **flake8**: Style guide enforcement
- **mypy**: Static type checking

Configuration files:
- `pyproject.toml`: Tool configuration settings
- `.flake8`: Flake8-specific settings
- `mypy.ini`: MyPy configuration
- `.editorconfig`: Editor settings for consistent formatting

## Repository Structure

- `server/`: Flask backend code
  - `models/`: SQLAlchemy ORM models
  - `routes/`: API endpoints organized by resource
  - `tests/`: Unit tests for the API
  - `utils/`: Utility functions and helpers
- `client/`: Astro/Svelte frontend code
  - `src/components/`: Reusable Svelte components
  - `src/layouts/`: Astro layout templates
  - `src/pages/`: Astro page routes
  - `src/styles/`: CSS and Tailwind configuration
- `scripts/`: Development and deployment scripts
- `data/`: Database files
- `docs/`: Project documentation
- `README.md`: Project documentation
