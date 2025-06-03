<script lang="ts">
    import { onMount } from "svelte";
    import Pagination from './Pagination.svelte';

    interface Game {
        id: number;
        title: string;
        description: string;
        publisher_name?: string;
        category_name?: string;
    }

    interface PaginationInfo {
        current_page: number;
        total_pages: number;
        total: number;
        per_page: number;
        has_next: boolean;
        has_prev: boolean;
    }

    interface GamesResponse {
        games: Game[];
        pagination: PaginationInfo;
    }

    export let games: Game[] = [];
    let loading = true;
    let error: string | null = null;
    let pagination: PaginationInfo | null = null;
    
    // Pagination state
    let currentPage = 1;
    let perPage = 12;

    // Get initial pagination parameters from URL
    function getUrlParams() {
        if (typeof window === 'undefined') return { page: 1, per_page: 12 };
        
        const urlParams = new URLSearchParams(window.location.search);
        return {
            page: parseInt(urlParams.get('page') || '1'),
            per_page: parseInt(urlParams.get('per_page') || '12')
        };
    }

    // Update URL with pagination parameters
    function updateUrl(page: number, per_page: number) {
        if (typeof window === 'undefined') return;
        
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('per_page', per_page.toString());
        
        // Update URL without page reload
        window.history.replaceState({}, '', url.toString());
    }

    const fetchGames = async (page: number = 1, per_page: number = 12) => {
        loading = true;
        error = null;
        
        try {
            const response = await fetch(`/api/games?page=${page}&per_page=${per_page}`);
            if(response.ok) {
                const data: GamesResponse = await response.json();
                games = data.games;
                pagination = data.pagination;
                currentPage = page;
                perPage = per_page;
                
                // Update URL to reflect current state
                updateUrl(page, per_page);
            } else {
                error = `Failed to fetch data: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    };

    // Handle page change
    function handlePageChange(event: CustomEvent<{ page: number }>) {
        fetchGames(event.detail.page, perPage);
    }

    // Handle per page change
    function handlePerPageChange(event: CustomEvent<{ perPage: number }>) {
        fetchGames(1, event.detail.perPage); // Reset to page 1 when changing per page
    }

    onMount(() => {
        const urlParams = getUrlParams();
        fetchGames(urlParams.page, urlParams.per_page);
    });
</script>

<div>
    <h2 class="text-2xl font-medium mb-6 text-slate-100">Featured Games</h2>
    
    {#if loading}
        <!-- loading animation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each Array(perPage) as _, i}
                <div class="bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
                    <div class="p-6">
                        <div class="animate-pulse">
                            <div class="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
                            <div class="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                            <div class="h-3 bg-slate-700 rounded w-full mb-3"></div>
                            <div class="h-3 bg-slate-700 rounded w-5/6 mb-4"></div>
                            <div class="h-2 bg-slate-700 rounded-full w-full mb-2"></div>
                            <div class="h-4 bg-slate-700 rounded w-1/4 mt-4"></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if error}
        <!-- error display -->
        <div class="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <p class="text-red-400">{error}</p>
        </div>
    {:else if games.length === 0}
        <!-- no games found -->
        <div class="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <p class="text-slate-300">No games available at the moment.</p>
        </div>
    {:else}
        <!-- game list -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="games-grid">
            {#each games as game (game.id)}
                <a 
                    href={`/game/${game.id}`} 
                    class="group block bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 hover:translate-y-[-6px]"
                    data-testid="game-card"
                    data-game-id={game.id}
                    data-game-title={game.title}
                >
                    <div class="p-6 relative">
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div class="relative z-10">
                            <h3 class="text-xl font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors" data-testid="game-title">{game.title}</h3>
                            
                            {#if game.category_name || game.publisher_name}
                                <div class="flex gap-2 mb-3">
                                    {#if game.category_name}
                                        <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300" data-testid="game-category">
                                            {game.category_name}
                                        </span>
                                    {/if}
                                    {#if game.publisher_name}
                                        <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-purple-900/60 text-purple-300" data-testid="game-publisher">
                                            {game.publisher_name}
                                        </span>
                                    {/if}
                                </div>
                            {/if}
                            
                            <p class="text-slate-400 mb-4 text-sm line-clamp-2" data-testid="game-description">{game.description}</p>
                            
                            <div class="mt-4 text-sm text-blue-400 font-medium flex items-center">
                                <span>View details</span>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>

        <!-- Pagination -->
        {#if pagination && pagination.total_pages > 1}
            <Pagination 
                {pagination} 
                on:pageChange={handlePageChange}
                on:perPageChange={handlePerPageChange}
            />
        {/if}
    {/if}
</div>