import { Lock } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COSMETIC_SLOTS, COSMETICS, contentKey } from '../../content/index.js'
import { storage } from '../../services/storage.js'
import { CHEF_SLOTS, isUnlocked } from './cosmetics.js'
import { equipCosmetic, equipCosmeticP2, loadCosmetics } from './cosmeticsStore.js'

// O localStorage é síncrono, então não há estado de carregamento; erro de leitura vira aviso
function readCosmetics() {
  try {
    return { state: loadCosmetics(), failed: false }
  } catch (error) {
    console.warn('[cosmetics] falha ao ler a personalização', error)
    return { state: null, failed: true }
  }
}

function SlotGroup({ slot, state, equippedId, group, onEquip }) {
  const { t } = useTranslation()
  const legend = {
    hat: t('profile.cosmetics.slotHat'),
    apron: t('profile.cosmetics.slotApron'),
    theme: t('profile.cosmetics.slotTheme'),
  }[slot]
  const items = COSMETICS.filter((c) => c.slot === slot)
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const unlocked = isUnlocked(state, item.id)
          const name = t(contentKey('cosmetic', item.id))
          return (
            <label
              key={item.id}
              className={`btn btn-sm gap-2 ${unlocked ? '' : 'btn-disabled'} has-checked:btn-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2`}
            >
              <input
                type="radio"
                name={`cosmetic-${group}-${slot}`}
                className="sr-only"
                value={item.id}
                checked={equippedId === item.id}
                disabled={!unlocked}
                onChange={() => onEquip(item.id)}
              />
              <span
                aria-hidden="true"
                className="size-4 rounded-full border"
                style={{ backgroundColor: item.color }}
              />
              {name}
              {!unlocked && (
                <span className="text-xs">
                  <Lock aria-hidden="true" className="inline size-3" />{' '}
                  {t('profile.cosmetics.locked', { score: item.unlockScore })}
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function CosmeticsPicker() {
  const { t } = useTranslation()
  const [{ state, failed }, setData] = useState(readCosmetics)

  const onEquip = (id) => setData({ state: equipCosmetic(id), failed: false })
  const onEquipP2 = (id) => setData({ state: equipCosmeticP2(id), failed: false })

  return (
    <section aria-labelledby="cosmetics-title" className="card w-full max-w-2xl bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 id="cosmetics-title" className="card-title">
          {t('profile.cosmetics.title')}
        </h2>
        {failed ? (
          <p role="alert" className="alert alert-error">
            {t('profile.cosmetics.error')}
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">{t('profile.cosmetics.hint', { score: state.bestScore })}</p>
            {!storage.isPersistent && (
              <p role="status" className="alert alert-warning">
                {t('profile.local.notPersistent')}
              </p>
            )}
            <h3 className="font-semibold">{t('profile.cosmetics.p1Title')}</h3>
            {COSMETIC_SLOTS.map((slot) => (
              <SlotGroup
                key={slot}
                slot={slot}
                state={state}
                equippedId={state.equipped[slot]}
                group="p1"
                onEquip={onEquip}
              />
            ))}
            <h3 className="font-semibold">{t('profile.cosmetics.p2Title')}</h3>
            <p className="text-sm opacity-80">{t('profile.cosmetics.p2Hint')}</p>
            {CHEF_SLOTS.map((slot) => (
              <SlotGroup
                key={slot}
                slot={slot}
                state={state}
                equippedId={state.equippedP2[slot]}
                group="p2"
                onEquip={onEquipP2}
              />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
