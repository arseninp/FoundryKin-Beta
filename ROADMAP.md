# ROADMAP — перенос, проверка, очистка

Обновлено 2026-11-03 по OLDCHAT20. Проверенный HEAD до документации efb873044ce59c308bce2aaf11ba73c709d869bf. Контекст — CONTEXT/handoff, задачи — TODO, контракты — ARCHITECTURE. Не выпуск.

## 1. Продолжить подключение жидкостей

Головы/статуи/eyeblossom уже подключены; OLDCHAT20 добавил decorated pot с 4 независимыми pattern choices, static active conduit с общим picker и вынес controls в preview-controls.mjs. Срез 29 source IDs, не весь каталог/основной editor. Повторять эти модели не нужно.

efb8730 добавил water/lava builders/4 назначения. Следующий участок — изучить существующие consumers/bindings и связать жидкости с resolver/общими controls/срезом. Ровный уровень 0..7 не симуляция потока; slopes/falling/tint/overlays/timing отсутствуют, Bedrock appearance открыт. Не создавать второй runtime/каталог/меню.

## 2. Уточнить остаток и широкий макет

Предварительно после четырёх жидкостей без assignments остаются bell/player_head/bubble_column по архивной сверке; подтвердить existing coverage/inputValidation/compile, не выдавать за свежий прогон. Отложенный scope не становится обязательным автоматически. Полные mobs/скелет/развёртки/cushion/bell отдельно; fire builder уже есть, плеер не geometry.

Вопрос tablet/desktop layout остаётся открытым: изучить editor/iframe/CSS/size consumers, затем согласовать адаптацию. Новая раскладка/breakpoints/редизайн не утверждены, mobile/paper tokens сохранить. Не потерять вопрос, но не возвращаться к устаревшей передаче, будто pot/conduit/liquids ещё не делались.

## 3. Проверить согласованный объём

Точечные проверки сопровождают перенос; общий аудит/расширение CI не заменяют работу. Existing workflow имеет pot/conduit checks, успешный Actions пока не подтверждён. Не суммировать перекрывающиеся исторические mocks/тестовые числа и не считать builder count числом принятых cards.

Проверить full PIN input/coverage/compile/validate/tests/CI и реальные PNG-TGA/UV/Three/WebGL, cards/source IDs/reopen/menu/forms/state/texture/poses/frames. Открыты pot/conduit/liquids rendering, dragon placement-scale, gel alpha/potted azalea/stem tint/kelp и прочие ограничения ARCHITECTURE. Отдельно воспроизвести гипотезы OLDCHAT17; ceiling rotation снят, исключённая реплика OLDCHAT19 не источник задач.

## 4. Довести новый редактор

Общий Find/editor/loaders; independent PNG/state/forms/stages/frames, EN/RU/Shared textures/role badges/design tokens. Player отдельно: timing/order/pause при рисовании/export ленты/clock-compass demo; static open/pose не player, item icon UX согласовать.

Принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async targets/storage transactions/import limits/dimensions/alpha/cache/URL lifecycle и pack/slot/frame/language/theme. Read-only preview не заменяет editor.

## 5. Очистить после успеха

После совместной приёмки убрать ненужное/дубли, тесты разбирать индивидуально. Только после готовности переключить runtime, синхронизировать HTML/FK_V/cache, удалить заменённый legacy.

Только main/малые пакеты/точное подтверждение/saved diff, после обрыва сначала GitHub. Новые test files отдельно согласовать; <25000 UTF-8 байт на файл. backup/fk070_packs не трогать. Полные items/entities/IndexedDB/большие паки/user backup/PWA-offline/права на ресурсы — отдельные этапы.
