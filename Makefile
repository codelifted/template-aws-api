AWS_DEFAULT_REGION := eu-west-1
CLI_VERSION		:= 4.3.1

get-cli:
	@docker run --rm \
		-w /s3 \
		-v $(shell pwd):/s3 \
        -e AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) \
		-e AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY) \
        amazon/aws-cli \
			s3 cp s3://wbr-cli-$(ENV)/wbr-$(CLI_VERSION) /s3/wbr \
			--region $(AWS_DEFAULT_REGION)
	@sudo chmod +x ./wbr

run:
	@./wbr run