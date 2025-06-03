<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    interface PaginationInfo {
        current_page: number;
        total_pages: number;
        total: number;
        per_page: number;
        has_next: boolean;
        has_prev: boolean;
    }

    export let pagination: PaginationInfo;
    export let perPageOptions: number[] = [6, 12, 24, 48];

    const dispatch = createEventDispatcher<{
        pageChange: { page: number };
        perPageChange: { perPage: number };
    }>();

    function goToPage(page: number) {
        if (page >= 1 && page <= pagination.total_pages) {
            dispatch('pageChange', { page });
        }
    }

    function changePerPage(perPage: number) {
        dispatch('perPageChange', { perPage });
    }

    // Generate page numbers to show (with ellipsis for large page counts)
    function getPageNumbers(): (number | string)[] {
        const current = pagination.current_page;
        const total = pagination.total_pages;
        const pages: (number | string)[] = [];

        if (total <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (current <= 4) {
                // Show pages 1-5 and ellipsis + last
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total);
            } else if (current >= total - 3) {
                // Show first + ellipsis + last 5 pages
                pages.push('...');
                for (let i = total - 4; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                // Show first + ellipsis + current-1, current, current+1 + ellipsis + last
                pages.push('...');
                for (let i = current - 1; i <= current + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total);
            }
        }

        return pages;
    }

    $: pageNumbers = getPageNumbers();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
    <!-- Results info -->
    <div class="text-sm text-slate-400">
        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} games
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center gap-4">
        <!-- Per page selector -->
        <div class="flex items-center gap-2">
            <label for="per-page" class="text-sm text-slate-400">Show:</label>
            <select 
                id="per-page"
                class="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={pagination.per_page}
                on:change={(e) => changePerPage(parseInt(e.currentTarget.value))}
                aria-label="Number of games per page"
            >
                {#each perPageOptions as option}
                    <option value={option}>{option} per page</option>
                {/each}
            </select>
        </div>

        <!-- Page navigation -->
        <nav class="flex items-center gap-1" aria-label="Pagination Navigation">
            <!-- Previous button -->
            <button
                class="px-3 py-2 text-sm border border-slate-600 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!pagination.has_prev}
                on:click={() => goToPage(pagination.current_page - 1)}
                aria-label="Go to previous page"
            >
                Previous
            </button>

            <!-- Page numbers -->
            {#each pageNumbers as page}
                {#if page === '...'}
                    <span class="px-3 py-2 text-sm text-slate-500">...</span>
                {:else}
                    <button
                        class="px-3 py-2 text-sm border border-slate-600 rounded transition-colors {page === pagination.current_page ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-500'}"
                        on:click={() => goToPage(page)}
                        aria-label="Go to page {page}"
                        aria-current={page === pagination.current_page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                {/if}
            {/each}

            <!-- Next button -->
            <button
                class="px-3 py-2 text-sm border border-slate-600 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!pagination.has_next}
                on:click={() => goToPage(pagination.current_page + 1)}
                aria-label="Go to next page"
            >
                Next
            </button>
        </nav>
    </div>
</div>