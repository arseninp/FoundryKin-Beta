# TODO — завершение моделей и интеграция

Обновлено 2026-10-31. Проверенный HEAD: 5c5f9f4. [x] означает наличие реализации по исходникам/истории, не успешный запуск или визуальную приёмку. Границы доказательств — CONTEXT.

## P0: повреждённый пакет хоруса

- [ ] Удалить из конца catalog/rules/utility-parts.mjs случайно вклеенный текст другого файла: строки path/content и код dependencies. Сейчас модуль синтаксически повреждён.
- [ ] В настоящем catalog/rules/dependencies.mjs подключить chorusPlantResources и объявление chorus_flower/stem; там их нет.
- [ ] Проверить текущие tools/model-policy.test.mjs и tools/chorus-models.test.mjs, восстановить согласованные изменения/тесты: они не вошли в последний коммит.
- [ ] Проверить точные сохранённые файлы: syntax, целевые тесты, normalize→dependencies→preview→build, отсутствие чужого текста и лишних изменений. Не повторять уже записанные geometry/assignments.

Последний запрос предусматривал восемь файлов; 5c5f9f4 изменил пять, причём dependencies попал внутрь utility-parts. Девять исторически заявленных проверок подготовленного хоруса не подтверждают сохранённый пакет. Документация код не исправляет.

## Следующий цельный проход

- [ ] После P0 использовать существующий tools/model-coverage.mjs на полном PIN candidate, проверить hashes и inputValidation: unresolved, missing builders, normalization, inventory/dependencies отдельно. Не создавать параллельный аудит.
- [ ] Выполнить node tools/validate.mjs и node --test tools/*.test.mjs на настоящих зависимостях; CI проверить отдельно. Не поручать запуск владельцу.
- [ ] Выбирать средние законченные модельные пакеты по фактическому остатку; не объявлять модельный этап закрытым до интеграционных проверок.

Свежего полного остатка нет. 78 unresolved в OLDCHAT12 и промежуточные 74 в OLDCHAT13 — исторические данные, не актуальный результат. 39 sign без построителя также относятся к старому отчёту. Ожидание 95 типов в тесте библиотеки не является запуском и не равно количеству готовых блоков.

## Записано, но не принято в новом UI

- [x] Potted azalea/pot/soil; adult bamboo/ограды, moss; поршни/redstone, fittings, растения и utility модели прежних проходов.
- [x] Cauldron/cocoa/daylight, pots/conduit/fire, dripleaf/sculk/cactus, dripstone/dried ghast/barrel и stage_cross.
- [x] Slime/honey_block, farmland/snow_layer с назначениями; coral wall fan aliases, candle cake aliases и technical cube ID. Не повторять подключения.
- [x] Planar error cleanup; crimson/warped roots→cross с сохранением pot PNG.
- [x] Общие индексированные cube states для ульев, crafter, suspicious sand/gravel, chiseled bookshelf и creaking heart.
- [x] Полый composter level 0..8; объёмный scaffolding с bottom и нижней обвязкой.
- [x] Piston head_back: обычная текстура сзади обоих поршней через dependency; sticky front сохраняется.
- [x] Mushroom variant 0..15: согласованный исходный индекс граней, шляпки default 14, ножка 10; cube UV не менялись.
- [x] Общий cage для mob/trial spawner/vault: внутренние поверхности, дно vault, 12/8 вариантов. Существа/предметы внутри не добавлены.
- [ ] Завершить повреждённый chorus пакет (P0), затем подтвердить интеграцию и полный библиотечный прогон.

## Данные и незавершённые контракты

- [ ] Проверить настоящие bindings/stages/variants/dependencies всех назначенных объектов, сохраняя повторы. Отдельно подтвердить грибной выбор на полном входе — сам механизм уже записан.
- [ ] Bamboo_sapling/adult forms; crop/adult torchflower relationship.
- [ ] Bedrock PNG/UV potted azalea, общие pot/soil/torch/pitcher/chorus/piston ресурсы.
- [ ] Реальные PNG alpha и порядок WebGL ядра/оболочки гелей; геометрия не доказывает прозрачность.
- [ ] Aliases/forms/states/icons/carried и saved-ID routes; waxed/infested equivalence, oxidation сохранить, normal/deepslate не сливать.
- [ ] Lit blast furnace front, auxiliary end_gateway/lava_cauldron, hashes/inventory, block↔item icons.
- [ ] Entity source/inventory/geometry/material adapter: sign/bed/bell и прочие block entities. Entities/cushion отложены; перед основным переключением согласовать scope. Sign/unknown не заменять cube.

## Интеграция и приёмка

- [ ] Перепроверить HTML; сохранить рабочий legacy 0.9.1 до приёмки.
- [ ] Отдельная проверяемая страница normalize→compile→access→preview→registry с настоящими PNG/Three. compileModelCatalog строгий: явно решить admission среза, не скрывая неподдержанные записи.
- [ ] Find/editor/loader используют общий объект и корректное обновление материалов; state/forms/stages не зависят от edit slot.
- [ ] Role-based icon badges, Shared textures, EN/RU, растущие подписи/design tokens без редизайна бумажного макета. UX поиска item icon согласовать.
- [ ] Плеер отдельно от state: timing/order, пауза при рисовании, экспорт всей ленты; часы/компас demo cycle.
- [ ] Saved-ID openTexture, transactions/async targets, PNG dimensions/alpha, import limits/cache/URL lifecycle.
- [ ] Реальные WebGL/Android: draw/undo/redo→Add→reopen→PNG→mcpack, Back, язык/тема, pack/slot/frame switching.
- [ ] После приёмки согласованного scope переключить HTML/FK_V/cache и удалить заменённый legacy runtime.

## Темп и последующие этапы

Готовый пакет сразу подавать на системное подтверждение, без отдельного сообщения о готовности. Постоянные отчёты остатка не обязательны; числа давать только с основанием. После записи сравнивать фактический полный пакет с одобренным, не только число файлов. Документы обновлять по запросу.

Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельно. Backup автоматически не обновлять; fk070_packs не очищать.
