jQuery(document).ready(function ($) {

    /**
     * Root check
     */
    const appRoot = document.getElementById('ppxo-app');
    if (!appRoot) return;



    /* -------------------------------------------------------------
     * TAB CONTROLLER 
     * ----------------------------------------------------------- */
    const TabController = (function () {

        const tabButtons = Array.from(document.querySelectorAll('.ppxo-tab'));
        const tabPanels  = Array.from(document.querySelectorAll('.ppxo-tab-panel'));

        let activeIndex = tabButtons.findIndex(
            btn => btn.getAttribute('aria-selected') === 'true'
        ) || 0;

        function setActiveTab(index, focus = true) {

            tabButtons.forEach((btn, i) => {
                const isActive = i === index;

                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tabPanels[i].setAttribute('aria-hidden', isActive ? 'false' : 'true');

                if (isActive && tabPanels[i].dataset.loaded === 'false') {
                    loadPanelContent(tabPanels[i].id);
                }
            });

            activeIndex = index;
            if (focus) tabButtons[index].focus();
        }

        function loadPanelContent(panelId) {
            const panel = document.getElementById(panelId);
            if (!panel) return;

            panel.dataset.loaded = 'true';

            if (panelId === 'ppxo-tab-analytics') {
                initializeAnalyticsCharts();
            }

            if (panelId === 'ppxo-tab-options') {
                Options.renderTemplates();
            }
        }

        function next() {
            setActiveTab((activeIndex + 1) % tabButtons.length);
        }

        function previous() {
            setActiveTab((activeIndex - 1 + tabButtons.length) % tabButtons.length);
        }

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {

            const isTypingElement =
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA';

            if (isTypingElement) return;

            if (event.key === 'ArrowRight') next();
            if (event.key === 'ArrowLeft') previous();
            if (event.key === 'Home') setActiveTab(0);
            if (event.key === 'End') setActiveTab(tabButtons.length - 1);
        });

        // Click + Enter/Space support
        tabButtons.forEach((btn, index) => {

            btn.addEventListener('click', () => setActiveTab(index));

            btn.addEventListener('keyup', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    setActiveTab(index);
                }
            });
        });

        return { setActiveTab, next, previous };

    })();




    /* -------------------------------------------------------------
     * OPTION MANAGER (Templates, Preview, Ordering, Undo/Redo)
     * ----------------------------------------------------------- */
    const Options = (function () {

        const grid     = document.getElementById('ppxo-templates-grid');
        const preview  = document.getElementById('ppxo-live-preview');
        const orderList = document.getElementById('ppxo-order-list');
        const undoBtn  = document.getElementById('ppxo-undo');
        const redoBtn  = document.getElementById('ppxo-redo');

        const templateLibrary = [
            { id: 'text', title: 'Text Input',  icon: 'fa-font',     desc: 'Single-line text' },
            { id: 'swatch', title: 'Color Swatch', icon: 'fa-palette', desc: 'Color selection' },
            { id: 'image', title: 'Image Choice', icon: 'fa-image',   desc: 'Image grid selection' },
            { id: 'file', title: 'File Upload',  icon: 'fa-upload',   desc: 'Upload files' }
        ];

        // Simple undo/redo store
        const history = { stack: [], pointer: -1 };

        function pushHistory(state) {
            history.stack = history.stack.slice(0, history.pointer + 1);
            history.stack.push(JSON.stringify(state));
            history.pointer++;
        }

        function undo() {
            if (history.pointer <= 0) return;
            history.pointer--;
            applyHistoryState();
        }

        function redo() {
            if (history.pointer >= history.stack.length - 1) return;
            history.pointer++;
            applyHistoryState();
        }

        function applyHistoryState() {
            const state = JSON.parse(history.stack[history.pointer]);
            renderOrder(state.order);
        }

        // Render template cards
        function renderTemplates() {
            if (!grid) return;

            grid.innerHTML = '';

            templateLibrary.forEach(template => {
                const card = document.createElement('button');
                card.className = 'ppxo-template';
                card.dataset.id = template.id;

                card.innerHTML = `
                    <div class="ppxo-template-card">
                        <i class="fa ${template.icon}"></i>
                        <div>
                            <strong>${template.title}</strong>
                            <div class="ppxo-muted">${template.desc}</div>
                        </div>
                    </div>
                `;

                card.addEventListener('click', () => chooseTemplate(template));
                grid.appendChild(card);
            });
        }

        function chooseTemplate(template) {
            if (!preview) return;

            preview.innerHTML = `
                <div class="ppxo-preview-sample">
                    <strong>${template.title}</strong>
                    <div class="ppxo-muted">${template.desc}</div>
                </div>
            `;

            const newItem = { id: template.id + '-' + Date.now(), title: template.title };

            const currentOrder = getCurrentOrder();
            currentOrder.push(newItem);

            renderOrder(currentOrder);
            pushHistory({ order: currentOrder });
        }

        function getCurrentOrder() {
            if (!orderList) return [];
            return Array.from(orderList.querySelectorAll('li')).map(li => ({
                id: li.dataset.id,
                title: li.dataset.title
            }));
        }

        function renderOrder(items) {

            if (!orderList) return;
            orderList.innerHTML = '';

            items.forEach(item => {
                const li = document.createElement('li');
                li.draggable = true;
                li.dataset.id = item.id;
                li.dataset.title = item.title;

                li.innerHTML = `
                    <span>${item.title}</span>
                    <i class="fa fa-grip-vertical"></i>
                `;

                li.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    li.classList.add('ppxo-dragging');
                });

                li.addEventListener('dragend', () => {
                    li.classList.remove('ppxo-dragging');
                });

                orderList.appendChild(li);
            });

            const rows = Array.from(orderList.querySelectorAll('li'));

            rows.forEach(li => {
                li.addEventListener('dragover', (event) => {
                    event.preventDefault();
                    li.classList.add('ppxo-drop-target');
                });

                li.addEventListener('dragleave', () => {
                    li.classList.remove('ppxo-drop-target');
                });

                li.addEventListener('drop', (event) => {
                    event.preventDefault();
                    li.classList.remove('ppxo-drop-target');

                    const draggedId = event.dataTransfer.getData('text/plain');
                    const draggedItem = orderList.querySelector(`li[data-id="${draggedId}"]`);
                    if (!draggedItem) return;

                    orderList.insertBefore(draggedItem, li.nextSibling);

                    const updated = Array.from(orderList.querySelectorAll('li')).map(el => ({
                        id: el.dataset.id,
                        title: el.dataset.title
                    }));

                    pushHistory({ order: updated });
                });
            });
        }

        // Buttons
        undoBtn && undoBtn.addEventListener('click', undo);
        redoBtn && redoBtn.addEventListener('click', redo);

        // Initialize empty state
        pushHistory({ order: [] });

        return { renderTemplates };

    })();



    /* -------------------------------------------------------------
     * QUICK TOUR MODAL
     * ----------------------------------------------------------- */
    // (function () {

    //     const tourBtn = document.getElementById('ppxo-open-tour');
    //     if (!tourBtn) return;

    //     tourBtn.addEventListener('click', openTourModal);

    //     function openTourModal() {

    //         const wrapper = document.createElement('div');
    //         wrapper.className = 'ppxo-tour-modal';

    //         wrapper.innerHTML = `
    //             <div class="ppxo-tour-box" role="dialog" aria-modal="true">
    //                 <h3>Quick tour</h3>
    //                 <ol>
    //                     <li>Dashboard overview</li>
    //                     <li>Options Manager: add and reorder templates</li>
    //                     <li>Analytics charts</li>
    //                     <li>Settings and integrations</li>
    //                 </ol>
    //                 <div style="text-align:right;margin-top:12px">
    //                     <button class="ppxo-btn ppxo-close-tour">Close</button>
    //                 </div>
    //             </div>
    //         `;

    //         document.body.appendChild(wrapper);

    //         wrapper
    //             .querySelector('.ppxo-close-tour')
    //             .addEventListener('click', () => wrapper.remove());
    //     }

    // })();



    /* -------------------------------------------------------------
     * LIGHT / DARK MODE TOGGLE
     * ----------------------------------------------------------- */
    (function () {
        const toggleBtn = document.getElementById('ppxo-toggle-theme');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', function () {
            const isDark = appRoot.classList.toggle('ppxo-dark');
            this.setAttribute('aria-pressed', isDark);
        });
    })();







});



jQuery(document).ready(function($) {
    let currentSelection = [];
    const $modal = $('#ppxo-delete-modal');
    const $confirmBtn = $('#ppxo-confirm-delete');

    // FIX: "Select All" Toggle Logic
    $('.ppxo-main-check').on('change', function() {
        const isChecked = $(this).prop('checked');
        // Sync both top and bottom master checkboxes
        $('.ppxo-main-check').prop('checked', isChecked);
        // Toggle all row checkboxes
        $('.ppxo-row-check').prop('checked', isChecked).trigger('change');
    });

    // FIX: Cancel Button working properly
    $('#ppxo-cancel-delete').on('click', function() {
        $modal.fadeOut(200);
        currentSelection = []; // Clear pending
    });

    // Close modal if clicking outside the card
    $modal.on('click', function(e) {
        if ($(e.target).is($modal)) $modal.fadeOut(200);
    });

    // Handle single and batch selection UI
    $(document).on('change', '.ppxo-row-check', function() {
        const count = $('.ppxo-row-check:checked').length;
        $('#selected-count').text(count);
        
        if (count > 0) {
            $('#ppxo-selection-panel').removeClass('d-none').fadeIn(200);
            $('#ppxo-footer-info').addClass('d-none');
        } else {
            $('#ppxo-selection-panel').fadeOut(200, function() {
                $('#ppxo-footer-info').removeClass('d-none');
            });
            $('.ppxo-main-check').prop('checked', false);
        }
    });

    // Delete Triggers
    $(document).on('click', '.ppxo-trigger-single-delete', function() {
        currentSelection = [$(this).data('id')];
        $modal.css('display', 'flex').hide().fadeIn(200);
    });

    $('.ppxo-trigger-batch-delete').on('click', function() {
        currentSelection = $('.ppxo-row-check:checked').map(function() { return $(this).val(); }).get();
        if (currentSelection.length > 0) $modal.css('display', 'flex').hide().fadeIn(200);
    });

    // FINAL AJAX EXECUTION
    $confirmBtn.on('click', function() {
        $confirmBtn.prop('disabled', true).html('<i class="fa fa-circle-notch fa-spin me-2"></i>Deleting...');

        $.ajax({
            url: ppxo_dashboard.ajax_url,
            type: 'POST',
            data: {
                action: 'ppxo_handle_deletion',
                ids: currentSelection,
                nonce: ppxo_dashboard.nonce
            },
            success: function(response) {
                if (response.success) {
                    // 1. Smoothly remove rows
                    currentSelection.forEach(id => {
                        $(`.ppxo-row-item[data-id="${id}"]`).css('background', '#fff5f5').fadeOut(500, function() {
                            $(this).remove();
                            updateResultCounts(); // Update text without reload
                        });
                    });

                    // 2. Show Premium Success Toast
                    showPpxoToast(response.data.message || 'Deleted successfully', 'success');
                    
                    $modal.fadeOut(200);
                    $('#ppxo-selection-panel').addClass('d-none');
                    $('.ppxo-main-check').prop('checked', false);
                } else {
                    showPpxoToast(response.data.message, 'error');
                }
            },
            error: function() {
                showPpxoToast('Connection error. Try again.', 'error');
            },
            complete: function() {
                $confirmBtn.prop('disabled', false).text('Delete Permanently');
            }
        });
    });

    // Function to update the "Showing X of Y" text dynamically
    function updateResultCounts() {
        const remaining = $('.ppxo-row-item').length;
        if (remaining === 0) {
            location.reload(); // Reload only if table is completely empty to show empty state
        }
    }

    // Premium Toast System
    function showPpxoToast(msg, type) {
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const toast = $(`
            <div class="ppxo-toast ${type}">
                <i class="fa ${icon}"></i>
                <span>${msg}</span>
            </div>
        `);
        $('body').append(toast);
        setTimeout(() => toast.addClass('show'), 100);
        setTimeout(() => {
            toast.removeClass('show').fadeOut(function() { $(this).remove(); });
        }, 3000);
    }
});





