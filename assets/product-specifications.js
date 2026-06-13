if (!customElements.get('product-specifications')) {
  customElements.define(
    'product-specifications',
    class ProductSpecifications extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.sectionId;
        this.dataElement = document.getElementById(`ProductSpecsData-${this.sectionId}`);
        if (!this.dataElement) return;

        try {
          this.data = JSON.parse(this.dataElement.textContent);
        } catch (error) {
          console.error(`[ProductSpecifications:${this.sectionId}] Failed to parse specs JSON`, error, this.dataElement.textContent);
          return;
        }

        this.variantMap = {};
        (this.data.variants || []).forEach((variant) => {
          this.variantMap[String(variant.id)] = variant.specs || {};
        });

        this.valueElements = this.querySelectorAll('[data-spec-value]');
        this.cardElements = this.querySelectorAll('[data-spec-card]');

        this.log('init', {
          sectionId: this.sectionId,
          initialVariantId: this.data.initialVariantId,
          variantCount: (this.data.variants || []).length,
          blocks: this.data.blocks,
          logs: this.data.logs
        });

        this.renderVariant(String(this.data.initialVariantId));

        this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          const variantId = event.data?.variant?.id;
          if (!variantId) return;

          const variantKey = String(variantId);
          this.log('variant-change', {
            variantId: variantKey,
            specs: this.variantMap[variantKey]
          });
          this.renderVariant(variantKey);
        });
      }

      disconnectedCallback() {
        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber();
        }
      }

      renderVariant(variantId) {
        const specs = this.variantMap[variantId] || {};

        this.valueElements.forEach((element) => {
          const key = element.dataset.specValue;
          const value = specs[key];
          const displayValue = value === undefined || value === null || value === '' ? '' : String(value);
          element.textContent = displayValue || (this.data.designMode ? '—' : '');
        });

        this.cardElements.forEach((card) => {
          const key = card.dataset.specCard;
          const value = specs[key];
          const hasValue = value !== undefined && value !== null && value !== '';
          card.hidden = !hasValue && !this.data.designMode;
        });
      }

      log(label, payload) {
        if (!this.data.debug) return;
        console.log(`[ProductSpecifications:${this.sectionId}] ${label}`, payload);
      }
    }
  );
}
