# CONTEXT — текущая передача

Обновлено 2026-11-10 по OLDCHAT32 и main. Проверенная кодовая точка перед документальной записью: 3f2cf4fc785c171a58036bee06ddd8df4f93dab5. Это не выпуск, не завершение рефакторинга и не полная приёмка.

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → README → docs/review-principles.md. Предыдущая документальная база 8c26ba7; технические и модельные контракты dc73611/8c3805b/3e503a8/5b083a7/3fe2d82 сохраняются, кроме явно обновлённых статусов. Старые задачи подключения MERS, исправления conduit, групп пузырей и слоёв знамени не повторять как отсутствующий код.

## Надёжная точка продолжения

Следующий согласованный пакет — простой Play/Pause кадров: один кадр в секунду, физические кадры вертикального PNG сверху вниз, после последнего первый. Не брать длительности и порядок из flipbook JSON. Предварительную обработку Mojang flipbook metadata не делать обязательной зависимостью этого режима.

Проигрыватель НЕ записан. Последняя подготовочная проверка OLDCHAT32 остановилась из-за тестовой обвязки, успешных тестов проигрывателя нет. В прочитанном fk-core.js пока ручные fPrev/fNext. Использовать существующие fr[slot], fi[slot], setFrame: отдельная история каждого кадра и обновление редактора/модели. packCur должен по-прежнему собирать полный вертикальный PNG, не текущий кадр.

Остановка при смене объекта/ресурса, начале рисования, выходе из редактора, скрытии приложения и смене/сбросе пака. Проверить фактические hooks начала рисования и async loading, исключить устаревшие callbacks. Без постоянного render loop, симуляции частиц и нового renderer. Подготовить законченный пакет и проверки, затем точное подтверждение записи.

## Уже сохранено в OLDCHAT32

- 833e3f9: bubble resource groups по declared bindings: up_top4, down_top4, outer8, inner2, всего18 текстур эффекта. Нормализацию337f753 не повторять.
- bc0f118: pot Основа/Рисунки, ghast ровно4 стадии0–3 по7 bindings. Реально общие файлы отдельно, без повторения и без пятой стадии; declared icons отдельным разделом.
- 41bf23b: общий начальный ракурс cards/editor для skull, copper_golem_statue, dried_ghast, chest, banner, big_dripleaf, tripwire_hook, sign. Сохранённый код меняет ANGLE_Y внешней stage.group при reset/выходе из flat, НЕ геометрию до bounds. Sprite flat, ручной ракурс обычной повторной сборки сохраняется. Полки/подсолнух повторно не компенсировать.
- 43dcfd2: active resource usage и borrowed dependencies вынесены из справки. f245aa6: пояснение source texture для bubble_column/end_portal/end_gateway, не симуляция.
- a804a64: resourceInfo перед stage, отдельные стили, пустой скрыт, reset/cancel/error очищают. Не плавающее меню; выбор PNG и группы ниже.
- 6726278: пояснение declared item icon в sprite; не все carried. Семантика carried бамбука ещё требует проверки.
- 7d37e29: явная family cauldron/lava_cauldron с сохранением records/IDs/resources. Обычный empty/water/colored_water, лавовый empty/lava; сброс только несовместимого content. PNG не выбирает content. Исправлена существующая UI-тестовая обвязка без удаления утверждений.
- 0195317: точные подписи water_still_grey и cauldron_water, не изменение ресурсов и не игровая система красителей.
- 57a7e30: 0–16 preview layers знамени,42 declared patterns и16 существующих цветов через тот же picker. f50a901: перестановка pattern вместе с color. eec565b: удаление выбранного слоя только из просмотра — реально записано, несмотря на неполный ответ чата. Миниатюры ещё нет.
- 8b8da8a: icon note использует рассчитанный active usage. 3f2cf4f: один обход dependencies для active и borrowed paths, не постоянный cache и не измеренное ускорение.

## Прежний прогресс — не повторять

Compiled editor0a502af, material families adb5d5d, frames/history/PNG291b5d9, GPU reuse0f27ede. Double slabs a048519/b82838b: equivalent alias, отличающиеся family form, smooth stone side сохранён, строгая валидация не ослабляется. Физическая чистка legacy ещё не закончена, FKCatalog.loadAny нужен PNG/TGA.

Items loader/generator/icon sprite8cd50c9/de36127/449872f; generated items3e698c4: items75/items-000.json, blocks1275, terrain1241, existing8201. Observer b7bf780/6b649d4, workflow dependencies5f75486. Standing/wall sign c92aaa9; cave vines c3d8970; hanging mounting8c3805b, default ceiling.

MERS8485bb4 внутри polished cinnabar без albedo/PBR; TGA diagnostics44a5f84; conduit inactive vertical UVbf90910; точные MERS/sign expectations b89b4b5. Владелец подтвердил работу conduit/MERS, не побайтовый RGBA/export. Не просить повторно оригинальный TGA через чат.

Banner family/resources50d12e1, groups3bcf213/da03234, исправление snap(k) dimensions cv[k] d5a6145; bubble normalization337f753 с provenance/icons/carried без pumpkin_side. Два ошибочных финальных ответа OLDCHAT31 не источник статуса, запись пузырей состоялась.

## Открытые задачи и ограничения

Миниатюры знамён, carried бамбука, MERS channel/export round trip, швы/исчезающие поверхности, сквозной editor, задержки и legacy cleanup открыты. Масштаб пока не менять. Каталог пользователь просмотрел до D; чтение builders не визуальная приёмка. Семейства задаются явно: частичное совпадение PNG не автоматическое объединение. После технической части нужен повторный визуальный обход на пропуски.

PNG/form/slot/state/pose независимы. Цвет/слои знамени — preview, не новые цветные PNG; ominous готовый sheet с сохранением слоёв для возврата. Owned/carried/icons/indexed repeats/shared dependencies и исходные IDs не терять. Раскрытие групп/плашки не выбирает PNG и не rebuild model. Shared-плашка активного файла не compiledInfo.shared всех файлов; owners+явные dependencies без ownership transfer.

Версии/cache и архивирование истории отложены, не задерживать ими блоки/макет. Старые логи не удалять. 1.0.0 ранее обсуждалась как будущая runtime-версия, не уже установленная и не срочная задача. После блоков, перед дальнейшей догрузкой items владелец планирует глубокий аудит кода/уязвимостей; это не уже выполненный аудит. docs/code-map.md пока не создан. Full mobs/skin/body/armor/tablet-desktop layout и прочие будущие этапы отдельно.

## Доказательства и рабочие правила

OLDCHAT32 и семь прежних документов прочитаны; сверены история main, editor-selection, editor-resource-usage, banner-controls, cauldron-controls, fk-core и полные diff a804a64/41bf23b. Это целевая сверка, не аудит всего репозитория/всех diff. Тесты приложения/Node/CI/WebGL/браузер в этом документальном проходе не запускались. Исторические локальные проверки не суммировать и не переносить на HEAD.

Пользователь в OLDCHAT32 сообщил «я проверил все ок вроде», отметив сложность UI. Это ограниченная проверка тогдашнего интерфейса, не приёмка всех следующих коммитов. При плохом интернете дальнейшие проверки отложены. Сейчас ничего проверять/присылать не нужно; новый запрос только конкретный и с основанием.

Только main, один каталог/runtime/picker/menu/index; исправлять причину в её слое. Unknown не cube, неоднозначность не первая PNG, готовую геометрию не писать повторно. Перед каждым внешним write точное подтверждение полного пакета, после saved diff/content; затем продолжать до следующего подтверждения/решения/блокера. Новые permanent tests отдельно согласовать; существующие проверки не ослаблять. Каждый файл <25000 UTF-8 bytes.

Бэкап/refactor-0.9/fk070_packs/localStorage не менять/не переносить/не очищать, не требовать чистки кэша. PIN Mojang/bedrock-samples46ba6ea985fb5a92d79a9419198f10dda14c199d. Кратко и понятно по-русски; явно говорить, нужна ли конкретная проверка. Не перекладывать проектирование/отладку на владельца.
