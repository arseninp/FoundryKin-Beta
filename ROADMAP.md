# ROADMAP — перенос, проверка, очистка

Обновлено 2026-11-03. Проверенный HEAD до записи: 40c82f0e6e3be884f73d0ee61bf8a8a385e5164d. Контекст/доказательства — CONTEXT, задачи — TODO, контракты — ARCHITECTURE. Не выпуск приложения.

## 1. Текущая передача: макет

Кодовое подключение согласованных голов/черепов/статуй и объединённого глазоцвета к отдельному preview записано. Используются общий FKModelState/FKM/CSS, PNG/form/state/pose раздельны. Срез 27 source IDs, не весь каталог/основной editor.

Владелец уже спросил, делалась ли адаптация узкого макета под планшет/компьютер. Изучить фактические layout/iframe/CSS/size consumers и ответить по коду; затем согласовать объём адаптации, сохранив телефонный сценарий/paper/design tokens. Новая раскладка/редизайн не утверждены. Не ждать повторной формулировки вопроса. Последняя реплика ассистента OLDCHAT19 исключена владельцем и не задаёт задачу.

## 2. Продолжить модели и основу

Не повторять bed/sign/auxiliary/lava cauldron/chest/shulker/banner, materials/lifecycle, fruit+stem/budding amethyst/aquatic/propagule/kelp. Статуи уже имеют sheets четырёх стадий/четыре позы; головы skeleton/wither skeleton/creeper/zombie/piglin/dragon — parent cards/source routes/preview.

Eyeblossom — одна card closed/open с разными явно заданными models и сохранённым glow/resources. Pumpkin/melon раздельны с соответствующим fruit/stem; budding amethyst source cards не сливать. Kelp A–D не рост, сохранять шесть paths/animation definitions.

Unknown не cube. Различать aliases/forms/states/stages/frames, сохранять owned PNG/carried/icons/indexed repeats/saved routes/concrete shared dependencies без ownership transfer. Окисления/normal/deepslate раздельны. Полные мобы/их скелет/развёртки/cushion/bell отложены, НЕ условие завершения этапа голов. Будущий entity-перенос переиспользует подходящую geometry, не фиктивные records/копии.

## 3. Проверить согласованный объём

Точечные syntax/diff/behaviour checks сопровождают перенос. Общий аудит/расширение CI не ставить вместо него. Полный PIN вход проверять existing coverage/inputValidation/compile/validate/tests, не вторым аудитом. Обновлённый workflow не доказывает успешный Actions; свежего coverage нет.

Принять реальные PNG/TGA/UV/Three/WebGL, cards/source IDs/reopen/menu/forms/state/texture/poses/frames, gel alpha/potted azalea/stem tint/kelp/block entities/dragon placement-scale. Исторические mocks не full UI. Возможные проблемы OLDCHAT17 воспроизвести отдельно; ceiling sign rotation suspicion снято.

## 4. Довести новый редактор

Общий Find/editor/loaders, независимые PNG/state/forms/stages/frames. EN/RU/Shared textures/role-based icon badges/design tokens. Адаптивность разрабатывать в существующих обязанностях/потребителях, не вторым runtime; конкретная раскладка ещё не выбрана.

Плеер отдельно от state: timing/order/pause при рисовании/export ленты/clock-compass demo. Static open/pose не плеер. UX item icon согласовать.

Принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async targets/storage transactions/import limits/dimensions/alpha/cache/URL lifecycle, pack/slot/frame/language/theme. Отдельный preview не заменяет editor.

## 5. Очистить после успеха

После совместной приёмки убрать ненужные/дублирующие части; тесты разбирать отдельно без массового удаления. Только после готовности переключить основной runtime, синхронизировать HTML/FK_V/cache и удалить заменённый legacy.

Только main, малые пакеты, точное подтверждение каждой записи/полный saved diff. После обрыва сначала GitHub. Новые test files отдельно согласовать; файлы <25000 UTF-8 байт, backup/fk070_packs не трогать. Полные items/entities/IndexedDB/большие паки/пользовательский backup/PWA-offline/права на ресурсы — отдельные этапы.
