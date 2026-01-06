<?php

namespace PPXO;

defined('ABSPATH') || exit;

class Frontend
{
    public function __construct()
    {
        add_action('wp', [$this, 'maybe_hook_forms']);
        add_action('wp_footer', [$this, 'frontend_js']);
    }

    public function maybe_hook_forms()
    {
        if (!is_product()) return;

        global $post;
        $attached_forms = get_post_meta($post->ID, '_ppxo_attached_forms', true);
        if (empty($attached_forms)) return;
        if (is_string($attached_forms)) $attached_forms = maybe_unserialize($attached_forms);

        foreach ($attached_forms as $form_id => $form_data) {
            if (!isset($form_data['type']) || $form_data['type'] !== 'global') continue;

            $hook = !empty($form_data['hook']) ? $form_data['hook'] : 'woocommerce_before_add_to_cart_button';
            add_action($hook, function () use ($form_id) {
                $this->render_form($form_id);
            });
        }
    }

    public function render_form($form_id)
    {
        $form_data = get_post_meta($form_id, '_ppxo_form_data', true);
        if (empty($form_data) || !isset($form_data['fields'])) return;

        echo '<div class="ppxo-extra-form" style="margin:10px 0;">';

        foreach ($form_data['fields'] as $field) {
            $id           = esc_attr($field['id'] ?? '');
            $type         = esc_attr($field['type'] ?? 'text');
            $label        = esc_html($field['label'] ?? '');
            $placeholder  = esc_attr($field['placeholder'] ?? '');
            $required     = !empty($field['required']) ? '1' : '0';
            $advanced     = $field['advanced'] ?? [];
            $defaultValue = esc_attr($advanced['defaultValue'] ?? '');
            $helpText     = esc_html($advanced['helpText'] ?? '');
            $description  = esc_html($advanced['description'] ?? '');
            $beforeText   = esc_html($advanced['beforeText'] ?? '');
            $afterText    = esc_html($advanced['afterText'] ?? '');
            $wrapperClass = esc_attr($advanced['wrapperClass'] ?? '');
            $inputClass   = esc_attr($advanced['inputClass'] ?? '');
            $displayStyle = $advanced['displayStyle'] ?? [];

            $fieldBackground = $displayStyle['fieldBackground'] ?? '';
            $labelStyle      = '';
            if (!empty($displayStyle['label'])) {
                $ls = $displayStyle['label'];
                $labelStyle = "color:{$ls['color']}; font-size:{$ls['fontSize']}px;";
            }
            $inputStyle = '';
            if (!empty($displayStyle['defaultValue'])) {
                $dv = $displayStyle['defaultValue'];
                $inputStyle .= "color:{$dv['color']}; font-size:{$dv['fontSize']}px;";
            }
            if ($fieldBackground) $inputStyle .= "background:{$fieldBackground}; padding:5px; border-radius:5px;";

            // Price label for main field
            $price = 0;
            if (!empty($field['pricing']['enabled']) && !empty($field['pricing']['amount'])) {
                $price = floatval($field['pricing']['amount']);
            }
            $priceLabel = $price ? ' <span class="text-success">(+ ' . get_woocommerce_currency_symbol() . $price . ')</span>' : '';

            echo '<div class="wfb-form-field ' . $wrapperClass . '" data-field-id="' . $id . '" style="margin-bottom:10px;' . $inputStyle . '">';
            if ($beforeText) echo '<div class="ppxo-before-text">' . $beforeText . '</div>';
            echo '<label class="form-label" style="' . $labelStyle . '">' . $label . ($required ? ' <span class="text-danger">*</span>' : '') . $priceLabel . '</label>';

            switch ($type) {
                case 'textarea':
                    $rows = intval($field['rows'] ?? 4);
                    $height = intval($field['height'] ?? 120);
                    echo "<textarea name='ppxo_field_{$id}' placeholder='{$placeholder}' rows='{$rows}' style='height:{$height}px;' data-price='{$price}' data-required='{$required}'>{$defaultValue}</textarea>";
                    break;

                case 'select':
                    echo "<select name='ppxo_field_{$id}' data-required='{$required}'>";
                    echo "<option value=''>Please select</option>";
                    if (!empty($field['options'])) {
                        foreach ($field['options'] as $opt) {
                            $optVal   = esc_attr($opt['value'] ?? $opt);
                            $optLabel = esc_html($opt['label'] ?? $opt);
                            $optPrice = floatval($opt['price'] ?? 0);
                            $selected = $defaultValue === $optVal ? 'selected' : '';
                            echo "<option value='{$optVal}' {$selected} data-price='{$optPrice}'>{$optLabel}" . ($optPrice ? " (+ " . get_woocommerce_currency_symbol() . $optPrice . ")" : '') . "</option>";
                        }
                    }
                    echo "</select>";
                    break;

                case 'checkbox':
                case 'radio':
                    if (!empty($field['options'])) {
                        foreach ($field['options'] as $i => $opt) {
                            $optVal   = esc_attr($opt['value'] ?? $opt);
                            $optLabel = esc_html($opt['label'] ?? $opt);
                            $optPrice = floatval($opt['price'] ?? 0);
                            $checked  = '';
                            if ($type === 'checkbox' && is_array($defaultValue) && in_array($optVal, $defaultValue)) $checked = 'checked';
                            if ($type === 'radio' && $defaultValue === $optVal) $checked = 'checked';
                            echo "<div class='form-check'><input class='form-check-input {$inputClass}' type='{$type}' name='ppxo_field_{$id}" . ($type === 'checkbox' ? '[]' : '') . "' value='{$optVal}' {$checked} data-price='{$optPrice}' data-required='{$required}'><label class='form-check-label'>{$optLabel}" . ($optPrice ? " (+ " . get_woocommerce_currency_symbol() . $optPrice . ")" : '') . "</label></div>";
                        }
                    }
                    break;

                case 'file':
                    echo "<input type='file' class='form-control {$inputClass}' name='ppxo_field_{$id}' data-required='{$required}'>";
                    break;

                default:
                    echo "<input type='{$type}' class='form-control {$inputClass}' name='ppxo_field_{$id}' placeholder='{$placeholder}' value='{$defaultValue}' data-price='{$price}' data-required='{$required}'>";
            }

            if ($helpText) echo "<div class='form-text'>{$helpText}</div>";
            if ($description) echo "<small class='form-text text-muted'>{$description}</small>";
            if ($afterText) echo '<div class="ppxo-after-text">' . $afterText . '</div>';

            echo '</div>';
        }

        echo '</div>';
    }




























public function frontend_js() {
    if (!is_product()) return;
    ?>
<script>
jQuery(document).ready(function($){

    console.log('PPXO frontend JS loaded');

    // Detect WooCommerce base price (sale or regular)
    const salePriceElem = $('.single-product .price ins .woocommerce-Price-amount bdi').first();
    const regularPriceElem = $('.single-product .price > .woocommerce-Price-amount bdi').first();
    const activePriceElem = salePriceElem.length ? salePriceElem : regularPriceElem;

    // Store true base price
    let basePrice = 0;
    if(activePriceElem.length){
        basePrice = parseFloat(activePriceElem.text().replace(/[^0-9.]/g,'')) || 0;
        activePriceElem.attr('data-base-price', basePrice);
        console.log('Base product price:', basePrice);
    } else {
        console.warn('No WooCommerce price element found!');
    }

    // Create total display area
    if($('.ppxo-total-display').length === 0){
        $('.ppxo-extra-form').after(`
            <div class="ppxo-total-display" style="margin-top:15px;padding:10px;border:1px solid #ddd;border-radius:8px;font-weight:500;">
                <div class="ppxo-breakdown"></div>
                <div class="ppxo-total-line" style="margin-top:10px;border-top:1px solid #eee;padding-top:5px;"></div>
            </div>
        `);
    }

    // Hidden input for cart meta
    if($('#ppxo_field_data').length === 0){
        $('form.cart').append('<input type="hidden" name="ppxo_field_data" id="ppxo_field_data" />');
    }

    // Helper: get field label without span (price)
    function getFieldLabel($el){
        const labelEl = $el.closest('.wfb-form-field').find('label.form-label').first();
        if(labelEl.length){
            const clone = labelEl.clone();
            clone.find('span').remove();
            return clone.text().trim();
        }
        return $el.attr('name');
    }

    function updateExtraPrice(){

        let extra = 0;
        let breakdownHTML = '';
        let selectedData = [];

        // --- Text, Number, Textarea ---
        $('.ppxo-extra-form input[type="text"][data-price], .ppxo-extra-form input[type="number"][data-price], .ppxo-extra-form textarea[data-price]').each(function(){
            const $el = $(this);
            const price = parseFloat($el.data('price')) || 0;
            const val = $el.val().trim();
            if(val !== ''){
                const label = getFieldLabel($el);
                extra += price;
                breakdownHTML += `<div>${label}: +${price.toFixed(2)}</div>`;
                selectedData.push({label, value: val, price});
            }
        });

        // --- Checkbox ---
        $('.ppxo-extra-form input[type="checkbox"]').each(function(){
            const $el = $(this);
            const price = parseFloat($el.data('price')) || 0;
            if($el.is(':checked')){
                const label = getFieldLabel($el);
                const optLabel = $el.closest('.form-check').find('label.form-check-label').first().text().trim();
                extra += price;
                breakdownHTML += `<div>${label} - ${optLabel}: +${price.toFixed(2)}</div>`;
                selectedData.push({label, value: optLabel, price});
            }
        });

        // --- Radio ---
        $('.ppxo-extra-form input[type="radio"]').each(function(){
            const $el = $(this);
            const price = parseFloat($el.data('price')) || 0;
            if($el.is(':checked')){
                const label = getFieldLabel($el);
                const optLabel = $el.closest('.form-check').find('label.form-check-label').first().text().trim();
                extra += price;
                breakdownHTML += `<div>${label} - ${optLabel}: +${price.toFixed(2)}</div>`;
                selectedData.push({label, value: optLabel, price});
            }
        });

        // --- Select ---
        $('.ppxo-extra-form select').each(function(){
            const $el = $(this);
            const selected = $el.find(':selected');
            const selectedVal = selected.val();
            if(selectedVal){
                const price = parseFloat(selected.data('price')) || 0;
                const label = getFieldLabel($el);
                const optLabel = selected.text().trim();
                extra += price;
                breakdownHTML += `<div>${label} - ${optLabel}: +${price.toFixed(2)}</div>`;
                selectedData.push({label, value: optLabel, price});
            }
        });

        // Calculate total with product price
        const total = basePrice + extra;

        // Update WooCommerce price display
        if(salePriceElem.length){
            salePriceElem.text(total.toFixed(2));
        } else if(regularPriceElem.length){
            regularPriceElem.text(total.toFixed(2));
        }

        // Update breakdown display
        $('.ppxo-breakdown').html(breakdownHTML || '<div>No extras selected</div>');
        $('.ppxo-total-line').html(`<strong>Total: ${total.toFixed(2)}</strong>`);

        // Save meta for cart
        $('#ppxo_field_data').val(JSON.stringify(selectedData));

        console.log('Updated total:', {basePrice, extra, total, selectedData});
    }

    // Listen to all inputs and selections
    $('.ppxo-extra-form').on('input change', 'input, select, textarea', updateExtraPrice);

    // Initial calculation
    updateExtraPrice();

});
</script>
<?php
}


 
}
