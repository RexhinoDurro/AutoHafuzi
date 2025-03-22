import { memo } from 'react';
import { Make, Model, Variant } from '../../hooks/useCarFilter';

interface MakeModelSelectorProps {
  makes: Make[];
  models: Model[];
  variants: Variant[];
  selectedMake?: string;
  selectedModel?: string;
  selectedVariant?: string;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  loading: {
    makes: boolean;
    models: boolean;
    variants: boolean;
  };
}

/**
 * Component for selecting make, model, and variant
 */
export const MakeModelSelector = memo(({
  makes,
  models,
  variants,
  selectedMake,
  selectedModel,
  selectedVariant,
  onMakeChange,
  onModelChange,
  onVariantChange,
  loading
}: MakeModelSelectorProps) => {
  return (
    <div className="space-y-2">
      <div>
        <select
          value={selectedMake || ''}
          onChange={(e) => onMakeChange(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading.makes}
        >
          <option value="">Të gjitha Markat</option>
          {loading.makes ? (
            <option value="" disabled>Duke ngarkuar...</option>
          ) : makes && makes.length > 0 ? (
            makes.map((make) => (
              <option key={make.id} value={make.id.toString()}>
                {make.name}
              </option>
            ))
          ) : (
            <option value="" disabled>Nuk ka marka të disponueshme</option>
          )}
        </select>
      </div>
      
      <div>
        <select
          value={selectedModel || ''}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={!selectedMake || loading.models}
        >
          <option value="">Të gjitha Modelet</option>
          {loading.models ? (
            <option value="" disabled>Duke ngarkuar...</option>
          ) : models && models.length > 0 ? (
            models.map((model) => (
              <option key={model.id} value={model.id.toString()}>
                {model.name}
              </option>
            ))
          ) : selectedMake ? (
            <option value="" disabled>Nuk ka modele të disponueshme për këtë markë</option>
          ) : null}
        </select>
      </div>
      
      <div>
        <select
          value={selectedVariant || ''}
          onChange={(e) => onVariantChange(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={!selectedModel || loading.variants}
        >
          <option value="">Të gjitha Variantet</option>
          {loading.variants ? (
            <option value="" disabled>Duke ngarkuar...</option>
          ) : variants && variants.length > 0 ? (
            variants.map((variant) => (
              <option key={variant.id} value={variant.id.toString()}>
                {variant.name}
              </option>
            ))
          ) : selectedModel ? (
            <option value="" disabled>Nuk ka variante të disponueshme për këtë model</option>
          ) : null}
        </select>
      </div>
    </div>
  );
});