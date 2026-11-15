# Временная передача аудита — 2026-11-16

Полный построчный аудит ВСЕГО репозитория НЕ закончен. Кодовая база 90852195250b601681489dc927d7501021acb531; 40af065edea13708180b1aea56caca5a8ae1630a меняет только CONTEXT/TODO. В продолжении не исправлялся код, не запускались новые тесты, CI, WebGL, Android или замеры. Чтение и поиск не равны успешному исполнению. Ниже — передача следующему ассистенту, а не сертификат отсутствия ошибок.

Временный файл: после закрытия задач перенести постоянные контракты в основную документацию, открытые задачи в TODO, затем удалить этот файл и ссылки на него отдельным согласованным изменением. Не удалять до передачи всех незакрытых пунктов. Сохранять результаты закрытия: ревизия, сценарий, команда/среда, фактический результат, ограничения.

## Как продолжить

Прочитать CONTEXT → TODO → этот отчёт, затем остальные входные документы по CONTEXT, учитывая их отставание. Владелец принимает результаты чата №37 до последнего ответа как основу; не перечитывать весь архив и весь уже разобранный код с нуля. Последний ответ №37 о палитрах сам по себе не доказательство дефекта. Сначала дочитать непросмотренное по зависимостям задач и проверить гипотезы, затем согласовать исправления, затем UI. Не превращать аудит в бесконечное расширение на всю геометрию. При этом не объявлять непрочитанные файлы проверенными.

Статусы: К — прослежено по исходникам, НЕ воспроизведено запуском; И — исторический результат №37, принятый владельцем; Г — гипотеза/приёмка/решение; У — очистка/организация. Приоритет: сохранность данных и ошибочные тесты → legacy cleanup → состояния/рисование → UI/оптимизация.

## Реестр чтения этой сессии

Полностью получены и прочитаны следующие исходники на указанной базе (это не утверждение о полном тестировании):

Корень: app.html, index.html, preview.html, fk-app.js, fk-editor.js, fk-core.js, fk-grid.js, fk-view.js, fk-tools.js, fk-palettes.mjs, fk-editor-palettes.mjs, fk-settings-picker.js, fk-menu.js, fk-model-state.js, fk-pixel-grid.js, fk-png-viewport.js, fk-png-viewport.css, fk-help.js, fk-log.js, fk-catalog-data.js, preview.mjs, preview-images.mjs, preview-controls.mjs.

catalog/: access.mjs, load.mjs, identity.mjs, resources.mjs, compile.mjs, model-policy.mjs, states.mjs, items.mjs, preview.mjs, prepared-preview.mjs, editor-selection.mjs, editor-comparison.mjs, editor-comparison-controls.mjs, editor-resource-usage.mjs, vanilla-images.mjs, banner-preview.mjs, banner-controls.mjs, leaf-preview.mjs, sign-preview.mjs, cauldron-controls.mjs, fruit-stem-selection.mjs, fruit-stem-preview.mjs, budding-amethyst-selection.mjs.

catalog/rules/: material-families.mjs, dependencies.mjs, forms.mjs, duplicates.mjs.

models/: library.mjs, registry.mjs, textures.mjs, materials.mjs, primitives.mjs, pitcher.mjs.

tools/: validate.mjs, build-family-data.mjs, catalog-families.mjs, catalog-family-paths.test.mjs, check-legacy-successors.mjs, atlas-render-diagnostic.mjs, piglin-visibility.mjs, curation.test.mjs, view-alpha.test.mjs.

.github/workflows/: все восемь — validate.yml, family-data.yml, legacy-check.yml, catalog-audit.yml, catalog-candidate.yml, fix-bamboo-gate-bedrock.yml, piglin-visibility.yml, atlas-render-diagnostic.yml. Чтение YAML не означает чтение всех вызываемых инструментов.

Документы непосредственно перечитаны: CONTEXT.md, TODO.md. Чат №37 на Drive прочитан целиком. Остальные входные документы в ЭТОМ продолжении целиком не перечитаны. README/ARCHITECTURE встречались в поисковой выдаче — не считать полным чтением. Деревья каталогов и результаты поиска также не считать чтением файлов.

### Что НЕ подтверждено полным чтением

Любой отслеживаемый файл вне реестра выше: чтение в этой сессии не подтверждено. Для точного остатка получить git ls-files на текущем HEAD, вычесть этот реестр, отдельно классифицировать исходники, тесты, данные и документы. Не писать проценты покрытия по памяти.

В частности: большинство специализированных models/*.mjs и catalog/rules/*.mjs; fk-i18n.js; CSS кроме fk-png-viewport.css; preview-config.mjs, preview-text.mjs и preview-*-data.mjs; catalog/audit.mjs; большинство tools и тестов, включая compiled-model-fixture.mjs и three-mock.mjs; все сгенерированные data-файлы. Их упоминание в imports не означает чтение.

fk-backup-store.mjs, fk-backup-host.mjs, fk-backups.mjs: полное чтение и 21 локальная проверка заявлены в №37; в текущем продолжении заново целиком НЕ читались. Не выдавать исторические результаты за свежий прогон. Аналогично прежние проверки геометрии и ресурсов не заменяют чтение/выполнение всех тестов после переноса.

## Единый список задач

### Данные и асинхронность

D01 К. fk-app.js, удаление в texList: splice происходит до save, false игнорируется. Имитировать отказ setItem; память/UI/storage должны сохранить текстуру. Исправить откат, проверить повторную попытку.

D02 Г/К. fk-app.js читает весь data один раз и не обновляет по storage. Две вкладки: А сохраняет, Б пишет старый data. Проверить создание/удаление/правки/backupEntries/restore. Нельзя молча терять чужие изменения; определить конфликтную политику, не уничтожать локальный draft простым перечитыванием.

D03 Г/К. fk-editor.js editTexture: polling без поколения/отмены; reset только loaded=null. Проверить А→Б, уход, смену пака, reset, поздний отказ А после успеха Б. Старый запрос не должен открывать прежний ресурс, менять режим или сообщение текущего запроса.

D04 К. fk-app.js eIcoF: FileReader без проверки актуального draft. Проверить два выбора с обратным завершением и переход в форму другого пака. Применять только актуальный результат.

D05 Г. fk-core.js selectCompiled: при same пропускается packCur(true); ошибка очищает choice/cur/slots/cv без возврата прежнего выбора. Проверить нарисовать→ошибка соседнего ресурса/состояния→reopen. Не заявлять окончательную потерю до воспроизведения: fr/files имеют отдельный lifecycle. Критерий — несохранённые пиксели доступны после отказа.

D06 К. fk-app.js load ловит JSON parse, но не структуру; затем data.packs.forEach. Проверить JSON без packs, неверные типы и вложенные null. Безопасный отказ без перезаписи повреждённой записи и падения оболочки.

D07 Г. Полный import→edit→save→reopen→export: несколько ресурсов, кадров, alpha, ошибка storage и повтор. Сравнить пути и пиксели, не только сообщения.

D08 Г/И. Бэкапы: реальный restore/reopen/export/quota, несколько паков, decode и конкуренция. Проверять на тестовых данных. 21 историческая mock-проверка не Android/storage round trip. Один слот/пак, снимок остаётся после restore, полезные контракты из CONTEXT сохранять.

### Импорт изображений и TGA

I01 К. app.html/fk-app.js: значок принимает image/*, экспорт кладёт исходные байты в pack_icon.png без конвертации. Проверить PNG/JPEG/WebP/ложное расширение. Явно отклонять либо преобразовывать, ограничить размеры/decode, совместить с D04. Реакция Minecraft не проверена.

I02 К. fk-app.js import: MAXB учитывает base64 текстур после распаковки очередного файла, не значок; оценка места не включает новый значок. Проверить огромный значок, текстуру, много файлов, повреждённый архив и отказ записи; отделить пределы обработки от размера конечной записи. Успешный rollback импортируемого пака сохранить.

I03 К. catalog/vanilla-images.mjs decodeTga: усечённые raw/RLE могут дополняться нулями; нет лимита pixels перед массивами; не обработан descriptor&16; проверить сочетания type/bpp и неподдерживаемые флаги. Матрица: truncated header/payload/packet, packet overflow, top/bottom и left/right, размеры. Отказ до больших выделений; корректные RGBA сохранять. Это ограничения декодера, НЕ доказательство поломки pinned cinnabar; workflow имеет эталонное сравнение.

I04 К. fk-tools.js replace: нет FileReader.onerror/Image.onerror. Сообщать отказ, не изменять пиксели/Undo; сохранить gen/context/dimensions/edits-защиту от запоздалого результата.

### Рисование и PNG

P01 И/К. fk-tools.js line: фиксированные 512 точек. Проверить длинные горизонталь/вертикаль/диагональ в обе стороны и допустимые размеры, корректное завершение без разрывов.

P02 К. Заливка тем же RGBA: pushUndo до floodFill, touched после раннего no-op. Проверить неизменность пикселей/Undo/dirty/edits; не делать пустую правку.

P03 Г. Измерить synchronous floodFill, стек соседей и полные Undo-снимки на больших допустимых изображениях. Пока не доказанная причина тормозов.

P04 И/К. fk-png-viewport.js reset-key — api.cur и размеры, не ресурс. Равноразмерные PNG одной карточки должны различаться; не сбрасывать просмотр при playback/comparison/рисовании.

P05 И/К. Повторный create viewport смотрит на родителя, уже изменённого первым mount. Проверить отсутствие вложенного UI и повторных обработчиков.

P06 У/Г. Viewport не возвращает общий dispose для observers/subscriptions. Сейчас один mount/документ, не объявлять доказанной утечкой; решить lifecycle перед перестройкой.

P07 К/Г. PNG download ставит setTimeout, сразу сообщает msg.png_saved. Проверить несколько файлов и блокировку браузером; правдивое сообщение о запуске, не обещание фактического сохранения.

### Состояния, материалы и диагностика

M01 К. preview-controls.mjs pitcherControlState проверяет старый plan.id. crop стадия0–3→variant grown переносит недопустимую stage, models/pitcher требует4. Проверить все стадии и обратный переход. Нормализовать переход, не ослаблять builder; сохранить PNG/pod_only/несохранённые пиксели. Связано с D05.

M02 К/Г. fruit-stem-preview.mjs и budding-amethyst-selection.mjs: disposeGeometry/release в catch может перекрыть исходную ошибку и прекратить очистку остальных. Имитировать двойной сбой, собрать причины и попытаться освободить всё, как prepared-preview. Крайний сценарий, не установленная причина телефонного сбоя.

M03 К. editor-resource-usage.mjs shared считается по use.id, счётчик по карточкам. Несколько вариантов одной карточки→Shared/Объектов1. Уточнить термины/число, сохранить список зависимостей.

M04 Г. Замерить textures.update: getImageData/новый RGBA/flip/alpha/compare всех ресурсов до решения об upload. GPU уже не обновляется при неизменных пикселях. Не обещать ускорение без замеров; возможный dirty-resource контракт не должен ломать playback/banner/comparison/resize.

### Палитры, настройки, меню

U01 К. fk-palettes.mjs storage→renderList заменяет input без фокуса/курсора; draft.value обычно сохраняется. Внешнее удаление набора обнуляет draft без сообщения. Проверить ввод и внешний rename/add/delete, сохранить понятное поведение.

U02 Г. rename палитры не сверяет исходное имя: последнее сохранение побеждает. Определить необходимость конфликта, не называть потерей всей палитры. change перечитывает storage; общей последовательной перезаписи устаревшего набора не найдено. Это не доказательство межвкладочной атомарности. color проверяет stale до duplicate.

U03 К. fk-app.js sUrlSave игнорирует false, reset и сообщение успеха перекрывают ошибку; theme/lang тоже применяются без проверки записи. Тест отказа: сохранённое/применённое/сообщение должны соответствовать выбранной политике.

U04 К. fk-help.js и fk-tools.js sheet не имеют полного dialog/focus/Escape/Tab/return-focus поведения; FKM сам этого не обеспечивает. Перенести общий контракт окон, не писать ещё по реализации. settings/model-state уже имеют полезные части.

U05 Г. FKM.close history.back + skip и немедленный open/pushState: проверить очередность popstate, быстрые повторы, Back, hold-menu→save-palette. Неподтверждённая гонка, не готовое обоснование переписать всё.

### Legacy cleanup и тесты

L01 К/У. Убрать неработающую ручную загрузку согласованно: index catLoad/catfile, core disabled, grid показ при failed/empty, help label. Не просто скрыть CSS. Установить понятный путь сообщения об ошибке каталога.

L02 И/К. fk-grid legacy schema/cards/ids + fk-app FKAPP.migrate(cat.ids/b/sp). Снять обращения и экспорт согласованно; не удалить нужную привязку импортированных ресурсов без проверки D07.

L03 И/К. editor-selection: старый блок FACES/ALL_SHAPES/shapeOfId/isDoorBlock/modelOf/doubleSided/shapeKeysFor/slotsOf/slotsFor/pathsFor/describe. Поиск isDoorBlock/slotsFor/pathsFor только внутри; doubleSided ещё одноимённый параметр FKView, не потребитель экспорта. Проверить остальные импорты/namespace перед удалением блока. compiled* и image helpers сохранить.

L04 И/К. FKView старые texture/material/mapMaterial/doorTexture и hidden. view-alpha первые5 сценариев используют их; последние2 уже production textures/prepared. Перенести смысл первых5: alpha1..254, binary cutout, переходы, RGBA/flip/no source mutation. Не переносить автоматически старый DoubleSide. Затем убрать API/hidden, сохранить render/capture/copies.

L05 И/К. curation.test lamp/pumpkin ожидают6 Mesh, primitives создаёт1 box с6 material slots. Разделить lamp/torch в объединённом тесте; не заменить число для обоих! Проверять материалы/грани/powered/PNG-independence. Не менять рабочую геометрию ради теста.

L06 У/Г. data/catalog-families + build-family-data + family-data workflow: runtime-потребитель не найден; подтвердить аудит-потребителей и удалить цепочку целиком, если не нужна. Workflow способен восстановить удалённые артефакты.

L07 У. tools/catalog-families.mjs — только re-export действующего catalog/rules/material-families.mjs. Второго family-компилятора НЕТ. Убрать посредника после смены импортов при необходимости; сохранить общий алгоритм и полезные тесты. catalog-family-paths.test смешивает3 family-теста и действующие resource/UI-тесты, целиком не удалять.

L08 У. fix-bamboo-gate-bedrock.yml — retired ручная echo-заглушка; кандидат на удаление. Не влияет на runtime-speed.

L09 Г. Полный граф импортов/HTML должен быть проверен отдельно: validate синтаксис не гарантирует разрешение всех зависимостей. Поиск FKShapes нашёл комментарии и тест запрещающего getter, не исполняемый dispatcher; FKCatalog search — документы и действующий FKCatalogData, их различать. Поиск не доказывает отсутствие вычисленных строк.

### Отдельный стенд и CI

V01 У/Г. Решить судьбу root preview.html/preview.mjs: read-only review slice, не второй builder. CI импортирует compileReview/REVIEW_IDS/resourcePaths/controls из preview.mjs. Перед удалением страницы вынести нужные функции. catalog/preview.mjs — рабочий resolver, prepared-preview и preview-controls тоже нужны редактору, их не удалять по общей части имени.

V02 К/Г. Если стенд остаётся: imageFrames без path режет высокие entity-атласы иначе, чем editor imageMeta (entity=1 frame). Проверить реальные размеры ресурсов. Reload не очищает сохранённый frame index — уменьшение числа кадров может дать out-of-range (проверить с учётом cache). storage key=null не обработан. Начальный ракурс отличается от FRONT_VIEW_MODELS в FKView. Это отдельные задачи стенда, не автоматически дефекты основного редактора.

C01 Г. Запустить tools/validate.mjs и все перенесённые tests; отдельно real Three/WebGL/Android. Наличие workflow не результат запуска. Проверить точный Pages SHA и cache-busting изменённых зависимостей, не чистить данные.

C02 У. validate отклоняет >25000 bytes, CONTEXT требует <25000 — согласовать границу. Документационные-only изменения не включены в push paths validate.

C03 Г. atlas/piglin workflows триггерятся изменением себя/скрипта, не всех models/renderer. Определить ручной запуск или расширение фильтров. Диагностики показывают кадры/сравнения, не доказывают визуальную приёмку.

C04 Г. check-legacy-successors — действующая диагностика старых Minecraft IDs, не builder. missing/unknown пишутся в отчёт без автоматического fail. Решить diagnostic vs gate, не трактовать зелёный запуск как отсутствие пропусков.

## Постоянные ограничения для будущей перестройки

Один реестр/library; unknown не fallback cube. Alias только после проверки эквивалентности; state/source-ID/card/form/slot различать. Coral wall fans могут быть aliases, исходные ID адресуемы: не требовать вернуть все отдельные карточки. Заимствованные ресурсы не превращать в owned.

Имена разных обязанностей должны различаться: стенд/resolver/instance/controls, не несколько неразличимых preview. Переименование только с импортами/HTML/tests/диагностикой. Общие UI-компоненты/токены/поведение без второго пути. Не переписывать ради переписи. Четыре UI-файла — направление, не реализованный факт.

Общий источник версии: убрать ручные подписи app0.9.20/editor0.9.17 и историческое «код не меняется». После save texture→catalog, pack params→назад, ошибка сохраняет форму. Scrollbars скрывать без блокировки прокрутки/фокуса/жестов. eJson readonly.

Сохранять принятую палитру fe20428, явный color=null до выбора, Samsung canvas-цвета, азалию и адресный depth-fix. До/после — baseline карточки с паком, PNG+3D, playback без потери кадра/ракурса, без рисования в До/playback. Количество1/3/9 принято, один renderer и общие ресурсы копий; не строить конструктор сцены заново. Детальные принятые контракты остаются в CONTEXT.

## Отменённые подозрения и исторические доказательства

Нет второго family-компилятора. Не считать неудачный временный duplicate/stale-тест палитры дефектом. Пиксельная сетка: 1px в JS компенсирован viewport CSS, смещение не доказано. Comments FKShapes и тест запрета обращения не удалять как runtime legacy. Независимый renderer диагностической страницы не второй builder.

№37:18 локальных моделей/ресурсов;8 textures/materials/primitives;21 backups;25 drawing/viewport (22 pass,3 mismatch). Ранее picker/lights16. Исторические mocks/алгоритмы не прогон всего репозитория после переноса. №36 palette41 — тоже не свежий результат.

Открыто вне завершённого охвата: полная безопасность, geometry/UV/seams всех моделей, MERS RGBA/export/browser round trip, реальный restore/quota, GPU/производительность, причины acacia_shelf/fetch library, Android и Pages. Не каждое название — установленная ошибка. Пользовательские данные/кэш и backup/refactor-0.9 не трогать. Только main, файл <25000 UTF-8 bytes, точное подтверждение записи и saved diff/content; permanent tests согласовать, старые не ослаблять. Не менять PIN/Three/JSZip попутно.
