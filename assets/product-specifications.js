if (!customElements.get('product-specifications')) {
  customElements.define(
    'product-specifications',
    class ProductSpecifications extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.sectionId;
        this.dataElement = document.getElementById(`ProductSpecsData-${this.sectionId}`);
        if (!this.dataElement) return;

        this.data = JSON.parse(this.dataElement.textContent);
        this.valueElements = this.querySelectorAll('[data-spec-value]');
        this.cardElements = this.querySelectorAll('[data-spec-card]');

        this.log('init', {
          sectionId: this.sectionId,
          initialVariantId: this.data.initialVariantId,
          variantCount: Object.keys(this.data.variants || {}).length,
          blocks: this.data.blocks,
          logs: this.data.logs
        });

        this.renderVariant(this.data.initialVariantId);

        this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          const variantId = event.data?.variant?.id;
          if (!variantId) return;

          this.log('variant-change', {
            variantId,
            specs: this.data.variants[String(variantId)]
          });
          this.renderVariant(String(variantId));
        });
      }

      disconnectedCallback() {
        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber();
        }
      }

      renderVariant(variantId) {
        const specs = (this.data.variants && this.data.variants[variantId]) || {};

        this.valueElements.forEach((element) => {
          const key = element.dataset.specValue;
          const value = specs[key] || '';
          element.textContent = value || (this.data.designMode ? '—' : '');
        });

        this.cardElements.forEach((card) => {
          const key = card.dataset.specCard;
          const value = specs[key];
          const hasValue = Boolean(value);
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
